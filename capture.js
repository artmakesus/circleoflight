var getPixels = require('get-pixels');
var serialPort = require('serialport');
var arduinoPort;

const NUM_ROWS = 200;
const NUM_LEDS = 142;
const BPR = NUM_LEDS * 3; // bytes per row

function capture(image, cb) {
	getPixels(image, function(err, pixels) {
		if (err) {
			cb(err);
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

		writeToArduino(bytes, cb);
	});
}

function writeToArduino(bytes, cb) {
	serialPort.list(function (err, ports) {
		if (err) {
			cb(err);
			return;
		}

		console.log('Getting a list of serial ports..');
		ports.forEach(function(port) {
			console.log(port.comName);
			if (port.manufacturer.indexOf('Arduino') >= 0) {
				arduinoPort = new serialPort.SerialPort(port.comName, { baudrate: 115200 });
				arduinoPort.on('open', function () {
					arduinoPort.write('A', function(err, results) {
						if (err) {
							cb(err);
							return;
						}

						var writeAndDrain = function(bs, callback) {
							arduinoPort.write(bs, function(err) {
								arduinoPort.drain(callback);
							});
						};

						var counter = 0;
						arduinoPort.on('data', function(data) {
							console.log('Count is ' + counter);
							if (counter < NUM_ROWS) {
								var bs = bytes.slice(counter * BPR, (counter+1) * BPR);
								writeAndDrain(bs, function(err) {
									if (err) {
										cb(err);
										return;
									}
								});
								counter++;
							} else {
								cb();
								return;
							}
						});
					});
				});
			}
		});
	});
}

module.exports = capture;
