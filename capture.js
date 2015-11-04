const NUM_ROWS = 800;
const NUM_LEDS = 142;
const BPR = NUM_LEDS * 3; // bytes per row
const PRODUCTION = true;

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
		if (port.manufacturer.indexOf('Teensy') >= 0) {
			console.log('Found Teensy!');
			arduinoPort = new SerialPort(port.comName, { baudrate: 115200 }, false);
			arduinoPort.open(function(err) {
				if (err) {
					console.log(err);
					return;
				}
				console.log('Connected to Teensy!');
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

	if (PRODUCTION) {
		GPhoto.list(function (list) {
			if (list.length === 0){
				console.log("No camera found");
				return;
			}
			var camera = list[0];
			console.log('Found', camera.model);

			var output = 'public/photos/' + Number(new Date()) + '.jpg'; 
			camera.takePicture({ download: true }, function (err, data) {
				if (err) {
					if (sendImageTimer) {
						clearTimeout(sendImageTimer);
					}
					capturing = false;
					return;
				}

				fs.writeFileSync(output, data);
			});
			console.log(camera);

			capturing = true;
			sendImageTimer = setTimeout(sendImageToArduino.bind(this, image, cb, output), 1000);
		});
	} else {
		var output = 'public/photos/' + Number(new Date()) + '.jpg'; 
		capturing = true;
		sendImageToArduino(image, cb, output);
	}
}

function sendImageToArduino(image, cb, output) {
	getPixels(image, function(err, pixels) {
		if (err) {
			if (capturing) {
				capturing = false;
				cb(err);
			}
			return;
		}
		console.log('Painting ' + image);

		if (PRODUCTION == false) {
			console.log('Creating dummy photo at', output);
			fs.readFile(image, function(err, data) {
				if (!err) {
					fs.writeFile(output, data);
				}
			});
		}

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

			r += 2 * Math.PI / NUM_ROWS;  // Rotate 1.8deg
		}

		if (arduinoPort) {
			if (arduinoPort.isOpen()) {
				writeToSerial(bytes, cb, output);
			}
		}
	});
}

function writeToSerial(bytes, cb, output) {
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
				console.log(counter);

				if (counter >= NUM_ROWS) {
					if (capturing) {
						capturing = false;
						cb(undefined, output);
					}
					return;
				}
			}
		}
	});
}

module.exports = capture;
