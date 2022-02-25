
/**
 * LedController.js
 * Provides a class for interfacing with the LED strips. 
 * This class should be used in response to canbus events
 * also this is in JS cause im not setting up TS for two scripts lmao
 * 
 */
const ws2812x = require("@gbkwiatt/node-rpi-ws281x-native");

// Colors
const GREEN = 0x00FF00;
const BLUE = 0x0000FF;
const RED = 0xFF0000;
const MAX_RPM = 12500;

class LedController {

    constructor(ledCount, gpioPin) {
        /**
         * the revbar is split up into 3 equal 'sections, defined by
         * floor(ledCount / 3). For ex. if we have 20 LED's there will be
         * three sections of 6, thus only 18 LED's will actually light up
         */
        this.sectionSize = Math.floor(ledCount / 3);
        // the actual amount of leds that will light up
        this.ledCount = this.sectionSize * 3;
        this.gpioPin = gpioPin;
        this.channel = ws2812x(this.ledCount, {
            gpio: this.gpioPin,
            brightness: 255,
            stripType: 'ws2812',
            invert: false
        });

        // the actual array of leds
        this.ledStrip = this.channel.array;
    }

    /**
     * Delay function provides a safe non-blocking way to delay for a given
     * amount of ms. This should only be used in preset animations. For drawing
     * 'frames' on the LED's we should be using the rate at which we recieve
     * can data, or Node's process.tick's.
     * @param ms 
     */
    #delay(ms) {
        return new Promise(res => setTimeout(res, ms));
    }

    /**
     * Scales the rpm to max number of LEDs that it should light up
     * Ex if the RPM's are 50% of the max, only half of the LEDS should light up
     * @param {number} rpm 
     */
    #scale(rpm) {
        return Math.floor((rpm * this.ledCount) / (MAX_RPM + this.ledCount));
    }

    async test() {
        // light up the LED's one at a time
        for (let pix = 0; pix < this.ledCount; pix++) {
            if (pix < this.sectionSize) {
                // green lights
                this.ledStrip[pix] = GREEN;
            } else if (pix >= this.sectionSize && pix < this.sectionSize * 2) {
                // blue lights
                this.ledStrip[pix] = BLUE;
            } else {
                this.ledStrip[pix] = RED;
            }

            /**
             * @NOTE hey this kinda looks like blocking code, isn't that bad?
             * Yes, BUT! it's not actually blocking, its queueing this code
             * to execute after the delay. The MDN docs have really good resources
             * on async/await code
             */
            ws2812x.render();
            await this.delay(50);
        }

        // flash the LED's
        for (let i = 0; i < 5; i++) {
            this.channel.brightness(0);
            ws2812x.render();
            await this.delay(50);
            this.channel.brightness(255);
            ws2812x.render();
            await this.delay(50);
        }

        // turn them off after 100ms
        this.delay(100);
        ws2812x.reset();
    }

    setRpm(rpm) {
        // clear the last 'frame'
        ws2812x.reset();
        // scale the rpm towards the size of the led strips
        const maxLeds = this.#scale(rpm);

        // light them up
        for (let pix = 0; pix < maxLeds; i++) {
            if (pix < this.sectionSize) {
                // green lights
                this.ledStrip[pix] = GREEN;
            } else if (pix >= this.sectionSize && pix < this.sectionSize * 2) {
                // blue lights
                this.ledStrip[pix] = BLUE;
            } else {
                this.ledStrip[pix] = RED;
            }
        }

        // render it
        ws2812x.render();
    }
}

module.exports.LedController = LedController;