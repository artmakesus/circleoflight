/* Moving color pattern on an APA102-based LED strip. */

/* By default, the APA102 uses pinMode and digitalWrite to write
 * to the LEDs, which works on all Arduino-compatible boards but
 * might be slow.	If you have a board supported by the FastGPIO
 * library and want faster LED updates, then install the
 * FastGPIO library and uncomment the next two lines: */
#include <string.h>

#include <APA102.h>

// States
const unsigned int STATE_WAITING = 0;
const unsigned int STATE_DISPLAYING = 1;
const unsigned int STATE_RESETTING = 2;

// Motor
const uint8_t ENABLE_PIN = 2;
const uint8_t DIR_PIN = 8;
const uint8_t STEP_PIN = 9;
const uint16_t NUM_STEPS = 800;

// LED Strip
const uint16_t LED_COUNT = 142;
const uint8_t DATA_PIN = 18;
const uint8_t CLOCK_PIN = 19;
APA102<DATA_PIN, CLOCK_PIN> ledStrip; // Create an object for writing to the LED strip.

// Create a buffer for holding the colors (3 bytes per color).
rgb_color colors[LED_COUNT];

// Set the brightness to use (the maximum is 31).
const uint8_t BRIGHTNESS = 12;

int color[3] = {0, 0, 0}; //color array
int colCounter = 0;
int ledCounter = 0;

const unsigned int STEP_DELAY = 2500;
unsigned int state = STATE_WAITING;
unsigned long stepLowTime = 0;
unsigned long stepHighTime = 0;
unsigned int nStepsDone = 0;
bool bMayStepHigh = false;

// Serial
bool bReceivedCommand = false;
bool bShouldWaitForNextPixelRow = false;

void setup() {
	Serial.begin(115200);
	while (Serial.available()) {
		Serial.read();
	}

	setupMotor();
	clearLEDs();
}

void loop() {
	switch (state) {
	case STATE_WAITING:
		wait();
		break;
	case STATE_DISPLAYING:
		display();
		break;
	case STATE_RESETTING:
		reset();
		break;
	}
}

void wait() {
	while (Serial.available() <= 0) {
		// do nothing
	}
	
	if (Serial.read() == 'A') {
		digitalWrite(ENABLE_PIN, HIGH);
		state = STATE_DISPLAYING;
	}
}

void display() {
	waitForNextPixelRow();

	bool bStepLow = (micros() - stepHighTime) >= STEP_DELAY;
	if (bStepLow && !bMayStepHigh) {
		digitalWrite(STEP_PIN, LOW);
		bMayStepHigh = true;
		stepLowTime = micros();
	}

	readAndDisplayPixels();

	bool bStepHigh = (micros() - stepLowTime) >= STEP_DELAY;
	if (bStepHigh && bMayStepHigh) {
		stepHighTime = micros();
		digitalWrite(STEP_PIN, HIGH);
		nStepsDone++;
		bMayStepHigh = false;
		if (nStepsDone > NUM_STEPS) {
			resetVariables();
			clearLEDs();

			Serial.write('B');
			Serial.flush();
			while (Serial.available()) {
				Serial.read();
			}

			delay(1000);

			state = STATE_RESETTING;
		} else {
			askForNextPixelRow();
		}
	}
}

void reset() {
	digitalWrite(DIR_PIN, LOW);
	for (int i = 0; i <= NUM_STEPS; i++) {
		digitalWrite(STEP_PIN, LOW);
		delayMicroseconds(STEP_DELAY);
		digitalWrite(STEP_PIN, HIGH);
		delayMicroseconds(STEP_DELAY);
	}
	digitalWrite(DIR_PIN, HIGH);

	digitalWrite(ENABLE_PIN, LOW);
	state = STATE_WAITING;
}

void clearLEDs() {
	memset(colors, 0, sizeof(colors));
	ledStrip.write(colors, LED_COUNT, BRIGHTNESS);
}

void setupMotor() {
	pinMode(DIR_PIN, OUTPUT);
	pinMode(STEP_PIN, OUTPUT);
	digitalWrite(DIR_PIN, HIGH);
}

void readAndDisplayPixels() {
	while (Serial.available()) {
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
			ledStrip.write(colors, LED_COUNT, BRIGHTNESS);
			ledCounter = 0;
			break;
		}
	}
}

void resetVariables() {
	colCounter = 0;
	ledCounter = 0;
	nStepsDone = 0;
	stepLowTime = 0;
	bMayStepHigh = false;
	bShouldWaitForNextPixelRow = false;
}

void askForNextPixelRow() {
	Serial.write('B');
	Serial.flush();
	bShouldWaitForNextPixelRow = true;
}

void waitForNextPixelRow() {
	if (bShouldWaitForNextPixelRow) {
		while (!Serial.available())
			;

		bShouldWaitForNextPixelRow = false;
	}
}
