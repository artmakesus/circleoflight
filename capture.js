const NUM_ROWS = 200;
const NUM_LEDS = 142;
const BPR = NUM_LEDS * 3; // bytes per row

var gphoto2 = require('gphoto2');
var GPhoto = new gphoto2.GPhoto2();
var getPixels = require('get-pixels');
var serialPort = require('serialport');
var SerialPort = require('serialport').SerialPort;
var fs = require('fs');
var arduinoPort;
var sendImageTimer;

var capturing = false;

console.log('Getting a list of serial ports..');
serialPort.list(function (err, ports) {
	if (err) {
		console.log(err);
		return;
	}

	if (ports.length == 0) {
		console.log('Couldn\'t find any serial port');
		return;
	}

	ports.forEach(function(port) {
		console.log(port.comName + ' ' + port.manufacturer);
		if (port.manufacturer.indexOf('Arduino') >= 0) {
			console.log('Found Arduino!');
			arduinoPort = new SerialPort(port.comName, { baudrate: 57600 }, false);
			arduinoPort.open(function(err) {
				if (err) {
					console.log(err);
					return;
				}
				console.log('Connected to Arduino!');
			});
		}
	});

	if (!arduinoPort) {
		console.log('Couldn\'t find Arduino port');
	}
});

function capture(image, cb) {
	if (!arduinoPort) {
		cb('no arduino port');
		return;
	}

	GPhoto.list(function (list) {
		if (list.length === 0){
			console.log("No camera found");
			return;
		}
		var camera = list[0];
		console.log('Found', camera.model);

		camera.takePicture({ download: true }, function (err, data) {
			if (err) {
				if (sendImageTimer) {
					clearTimeout(sendImageTimer);
				}
				capturing = false;
				return;
			}

			fs.writeFileSync(__dirname + '/public/photos/' + Number(new Date()) + '.jpg', data);
			//console.log(data);
		});

		capturing = true;
		sendImageTimer = setTimeout(sendImageToArduino.bind(this, image, cb), 1000);
	});
}

function sendImageToArduino(image, cb) {
	getPixels(image, function(err, pixels) {
		if (err) {
			if (capturing) {
				capturing = false;
				cb(err);
			}
			return;
		}
		console.log('Painting ' + image);

		// Image dimension
		var width = pixels.shape[0];
		var height = pixels.shape[1];
		var halfWidth = width * 0.5;
		var halfHeight = height * 0.5;

		// Find center pixel
		var center = (halfWidth + halfHeight * width) * 4;
		var originRed = pixels.data[center];
		var originGreen = pixels.data[center + 1];
		var originBlue = pixels.data[center + 2];

		var radius = width > height ? halfWidth / NUM_LEDS : halfHeight / NUM_LEDS;
		var bytes = new Uint8Array(NUM_ROWS * BPR);
		var r = 0;

		for (var j = 0; j < NUM_ROWS; j++) {
			var k = j * BPR;
			bytes[k++] = originRed;
			bytes[k++] = originGreen;
			bytes[k++] = originBlue;

			var px = halfWidth;
			var py = halfHeight;

			for (var i = 1; i < NUM_LEDS; i++) { // Starts at 1 to skip the center pixel which is always the same
				px += Math.cos(r) * radius;
				py += Math.sin(r) * radius;

				var x = Math.round(px);
				var y = Math.round(py);

				var index = (x + y * width) * 4;
				var red = pixels.data[index];
				var green = pixels.data[index + 1];
				var blue = pixels.data[index + 2];

				bytes[k++] = red;
				bytes[k++] = green;
				bytes[k++] = blue;
			}

			r += Math.PI * 0.01;  // Rotate 1.8deg
		}

		if (arduinoPort) {
			if (arduinoPort.isOpen()) {
				writeToSerial(bytes, cb);
			}
		}
	});
}

function writeToSerial(bytes, cb) {
	var writeAndDrain = function(bs, callback) {
		arduinoPort.write(bs, function(err) {
			if (err) {
				console.log(err);
				cb(err);
				return;
			}
			arduinoPort.drain(callback);
		});
	};

	writeAndDrain('A', function(err) {
		if (err) {
			if (capturing) {
				capturing = false;
				cb(err);
			}
			return;
		}
	});

	var counter = 0;
	arduinoPort.on('data', function(data) {
		for (var i = 0; i < data.length; i++) {
			if (counter < NUM_ROWS) {
				var bs = bytes.slice(counter * BPR, (counter+1) * BPR);
				writeAndDrain(bs, function(err) {
					if (err) {
						if (capturing) {
							capturing = false;
							cb(err);
						}
						return;
					}
				});
				counter++;
				console.log('Count is ' + counter);

				if (counter >= NUM_ROWS) {
					if (capturing) {
						capturing = false;
						cb();
					}
					return;
				}
			}
		}
	});
}

function randomFileName() {
	var name = '';
	for (var i = 0; i < 64; i++) {
		name += String.fromCharCode(Math.floor(26 * Math.random()));
	}
	return name;
}

module.exports = capture;
