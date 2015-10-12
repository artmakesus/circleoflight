var getPixels = require("get-pixels");
var serialPort = require("serialport");
var arduinoPort;

const NUM_ROWS = 200;
const NUM_LEDS = 72;
const BPR = NUM_LEDS * 3; // bytes per row

function capture(image, cb) {
	getPixels(image, function(err, pixels) {
		if (err) {
			cb(err);
			return;
		}

		// Image dimension
		const width = pixels.shape[0];
		const height = pixels.shape[1];
		const halfWidth = width / 2;
		const halfHeight = height / 2;

		// Find center pixel
		const center = (halfWidth + halfHeight * width) * 4;
		const originRed = pixels.data[center];
		const originGreen = pixels.data[center + 1];
		const originBlue = pixels.data[center + 2];

		const radius = 5;
		var r = 0;
		var bytes = new Uint8Array(NUM_ROWS * BPR);

		for (var j = 0; j < NUM_ROWS; j++) {
			var k = j * BPR;
			bytes[k++] = originRed;
			bytes[k++] = originGreen;
			bytes[k++] = originBlue;

			var px = halfWidth;
			var py = halfHeight;

			for (var i = 1; i < NUM_LEDS; i++) { // Starts at 1 to skip the center pixel which is always the same
				px = px  + Math.cos(r) * radius;
				py = py  + Math.sin(r) * radius;

				var x = Math.round(px);
				var y = Math.round(py);

				const index = (x + y * width) * 4;
				var red = pixels.data[index];
				var green = pixels.data[index + 1];
				var blue = pixels.data[index + 2];

				bytes[k++] = red;
				bytes[k++] = green;
				bytes[k++] = blue;
			}

			r += Math.PI / 100;  // Rotate 1.8deg
		}

		writeToArduino(bytes, cb);
	});
}


function writeToArduino(bytes, cb) {
	var counter = 0;

	serialPort.list(function (err, ports) {
		if (err) {
			cb(err);
			return;
		}

		ports.forEach(function(port) {
			if (port.manufacturer.indexOf("Arduino") >= 0) {
				arduinoPort = new serialPort.SerialPort(port.comName, { baudrate: 115200 });
				arduinoPort.on("open", function () {
					console.log('Arduino port opened at ' + port.comName);

					arduinoPort.on('data', function(data) {
						// console.log("Count is " + counter);

						var bs = bytes.slice(counter*216, (counter+1)*216);
						if (counter < 200) {
							arduinoPort.write(bs, function(err, results) {
								if (err) {
									cb(err);
									return;
								}

								counter++;
							});
						} else {
							cb();
							return;
						}
					});
				});
			}
		});
	});
}

module.exports = capture;
