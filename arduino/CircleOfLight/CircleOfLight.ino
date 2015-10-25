/* Moving color pattern on an APA102-based LED strip. */

/* By default, the APA102 uses pinMode and digitalWrite to write
 * to the LEDs, which works on all Arduino-compatible boards but
 * might be slow.	If you have a board supported by the FastGPIO
 * library and want faster LED updates, then install the
 * FastGPIO library and uncomment the next two lines: */
#include <FastGPIO.h>
#define APA102_USE_FAST_GPIO

#include <APA102.h>

// LED Strip
const uint16_t LED_COUNT = 142;
const uint8_t dataPin = 11;
const uint8_t clockPin = 12;
APA102<dataPin, clockPin> ledStrip; // Create an object for writing to the LED strip.

// Motor
const uint8_t dirPin = 8;
const uint8_t stepPin = 9;

// Create a buffer for holding the colors (3 bytes per color).
rgb_color colors[LED_COUNT];

// Set the brightness to use (the maximum is 31).
const uint8_t brightness = 1;

int color[3] = {0, 0, 0}; //color array
int colCounter = 0;
int ledCounter = 0;

const unsigned int STEP_DELAY = 20;
unsigned long stepLowTime = 0;
unsigned int stepsDone = 0;
bool bReceivedCommand = false;
bool bMayStepHigh = false;
bool bShouldWaitForNextPixelRow = false;

void setup() {
	Serial.begin(115200);
	while (Serial.available()) {
		Serial.read();
	}

	pinMode(dirPin, OUTPUT);
	pinMode(stepPin, OUTPUT);
	digitalWrite(dirPin, HIGH);	
}

void loop() {
	if (!bReceivedCommand) {
		waitForCommand();
	} else {
		doCommand();
	}
} // end of loop()

void waitForCommand() {
	while (Serial.available() <= 0)
		;
	
	if (Serial.read() == 'A') {
		bReceivedCommand = true;
	}
}

void doCommand() {
	if (bShouldWaitForNextPixelRow) {
		waitForNextPixelRow();
	}

	if (!bMayStepHigh) {
		digitalWrite(stepPin, LOW);
		bMayStepHigh = true;
		stepLowTime = millis();
	}

	readAndDisplayPixels();

	bool isTimeToStepHigh = (millis() - stepLowTime) >= STEP_DELAY;
	if (isTimeToStepHigh && bMayStepHigh) {	
		digitalWrite(stepPin, HIGH);
		bMayStepHigh = false;

		stepsDone++;
		if (stepsDone >= 200) {
			reset();
		} else {
			askForNextPixelRow();
		}
	}
}

void readAndDisplayPixels() { while (Serial.available()) {
		color[colCounter] = Serial.read();
		colCounter++;

		if (colCounter > 2) {
			colors[ledCounter].red = color[0];
			colors[ledCounter].green = color[1];
			colors[ledCounter].blue = color[2];
			ledCounter++;
			colCounter = 0;
		}

		if (ledCounter > LED_COUNT - 1) {				
			ledStrip.write(colors, LED_COUNT, brightness);
			ledCounter = 0;
			break;
		}
	}
} // end of readAndDisplayPixels()

void askForNextPixelRow() {
	Serial.write('B');
	Serial.flush();
	bShouldWaitForNextPixelRow = true;
}

void waitForNextPixelRow() {
	while (!Serial.available())
		;

	bShouldWaitForNextPixelRow = false;
}

void reset() {
	Serial.write('B');
	Serial.flush();

	delay(3000);
	digitalWrite(dirPin, LOW);
	for (int i = 0; i < 200; i++) {
		digitalWrite(stepPin, LOW);
		delay(20);
		digitalWrite(stepPin, HIGH);
	}
	digitalWrite(dirPin, HIGH);

	colCounter = 0;
	ledCounter = 0;
	stepsDone = 0;
	stepLowTime = 0;
	bReceivedCommand = false;
	bMayStepHigh = false;
	bShouldWaitForNextPixelRow = false;

	while (Serial.available()) {
		Serial.read();
	}
}
