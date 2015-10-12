/* Moving color pattern on an APA102-based LED strip. */

/* By default, the APA102 uses pinMode and digitalWrite to write
 * to the LEDs, which works on all Arduino-compatible boards but
 * might be slow.	If you have a board supported by the FastGPIO
 * library and want faster LED updates, then install the
 * FastGPIO library and uncomment the next two lines: */
#include <FastGPIO.h>
#define APA102_USE_FAST_GPIO

#include <APA102.h>

// Define which pins to use.
const uint8_t dataPin = 11; //led
const uint8_t clockPin = 12;	//led

const uint8_t dirPin = 8;	//motor
const uint8_t stepPin = 9; //motor

// Create an object for writing to the LED strip.
APA102<dataPin, clockPin> ledStrip;

// Set the number of LEDs to control.
const uint16_t ledCount = 142;

// Create a buffer for holding the colors (3 bytes per color).
rgb_color colors[ledCount];

// Set the brightness to use (the maximum is 31).
const uint8_t brightness = 1;

int color[3] = {0, 0, 0}; //color array
int colCounter = 0;
int ledCounter = 0;

bool gotCommand = false;
const unsigned int stepDelay = 10;
unsigned int elapsedTimeSinceStepLow = 0;
bool mayStepHigh = false;
unsigned int stepsDone = 0;
bool waitingForNextPixelRow = false;

void setup() {
	Serial.begin(115200); // Start serial communication at 115200 bps
	while (Serial.available()) {
		Serial.read();
	}

	pinMode(dirPin, OUTPUT);
	pinMode(stepPin, OUTPUT);
	digitalWrite(dirPin, HIGH);	
}

void loop() {
	if (!gotCommand) {
		waitForCommand();
	} else {
		doCommand();
	}
} // end of loop()

void waitForCommand() {
	while (Serial.available() <= 0)
		;
	
	if (Serial.read() == 'A') {
		gotCommand = true;
	}
}

void doCommand() {
	if (waitingForNextPixelRow) {
		while (Serial.available())
			;
	}

	if (!mayStepHigh) {
		digitalWrite(stepPin, LOW);
		mayStepHigh = true;
		elapsedTimeSinceStepLow = millis();
	}

	readAndDisplayPixels();

	bool isTimeToStepHigh = (millis() - elapsedTimeSinceStepLow) > stepDelay;
	if (isTimeToStepHigh && mayStepHigh) {	
		digitalWrite(stepPin, HIGH);
		mayStepHigh = false;

		stepsDone++;
		if (stepsDone >= 200) {
			stepsDone = 0;
			gotCommand = false;
		} else {
			askForNextPixelRow();
		}
	}
}

void readAndDisplayPixels() {
	while (Serial.available() > 0) { // If data is available to read
		color[colCounter] = Serial.read();
		colCounter++;

		if (colCounter > 2) {
			colors[ledCounter].red = color[0];
			colors[ledCounter].green = color[1];
			colors[ledCounter].blue = color[2];
			ledCounter++;
			colCounter = 0;
		}

		if (ledCounter > ledCount - 1) {				
			ledStrip.write(colors, ledCount, brightness);
			ledCounter = 0;
			break;
		}
	}
} // end of readFromSerial()

void askForNextPixelRow() {
	Serial.println("A");
	Serial.flush();
	waitingForNextPixelRow = true;
}
