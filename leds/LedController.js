
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
const YELLOW = 0xFFFF00;
const MAX_RPM = 9000;
const MIN_RPM = 5000;
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

        // the amount of LED's that was filled last, this is used to reduce
        // the amount of updates we have to do for the LED's
        this.lastLedCount = -1;
        this.lastRedline = 0;
        // a timeout id for idle detection
        this.timeout = null;
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
     * Busy waiting blocks the thread
     * BE CAREFUL THIS SHOULDNT BE USED 
     * @param {Number} ms 
     */
    #blocking_delay(ms) {
        const stop = new Date().getTime();
        console.log("BLOCKED");
        while (new Date().getTime() < stop + ms) { }
        console.log("UNBLOCKED");
    }

    /**
     * Scales the rpm to max number of LEDs that it should light up
     * Ex if the RPM's are 50% of the max, only half of the LEDS should light up
     * @param {number} rpm 
     */
    #scale(rpm) {
        return Math.floor(((rpm - MIN_RPM) * this.ledCount) / ((MAX_RPM - MIN_RPM) + this.ledCount));
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

            ws2812x.render();
            await this.#delay(50);
        }

        // flash the LED's
        for (let i = 0; i < 5; i++) {
            this.channel.brightness = 0;
            ws2812x.render();
            await this.#delay(50);
            this.channel.brightness = 255;
            ws2812x.render();
            await this.#delay(50);
        }

        // turn them off after 100ms
        this.#delay(100);
        ws2812x.reset();
    }

    /**
     * Given an rpm, this function will determine how many LED's to light up
     * and which color to let them up
     * @param {number} rpm 
     */
    setRpm(rpm) {
        // clearing any idle detectors
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        // get the amount of LED's we need to light up
        const maxLeds = this.#scale(rpm);
        // check to see if this is a NEW redline state
        if (maxLeds >= (this.ledCount - 2)) {
            if(new Date().getTime() - this.lastRedline > 200) {
                this.flashRedline();
            }
            return; // theres nothing left in this function that we want to do
        }
        if (this.lastLedCount === maxLeds) {
            // check to see if we actually need to update the leds
            return;
        } else {

            // lastly set the new ledcount
            this.lastLedCount = maxLeds;
        }

        // otherwise fill up the leds
        this.fillLeds(maxLeds);
    }

    fillLeds(maxLeds) {
        // clear the last 'frame'
        ws2812x.reset();

        // light them up
        for (let pix = 0; pix < maxLeds; pix++) {
            if (pix < this.sectionSize) {
                // green lights
                this.ledStrip[pix] = GREEN;
            } else if (pix >= this.sectionSize && pix < this.sectionSize * 2) {
                // blue lights
                this.ledStrip[pix] = YELLOW;
            } else {
                this.ledStrip[pix] = RED;
            }
        }

        ws2812x.render();
    }


    async flashRedline() {
        // clear the frame
        ws2812x.reset();
        // fill all the leds up with blue
        for (let pix = 0; pix < this.ledCount; pix++) {
            this.ledStrip[pix] = BLUE;
        }

        // flash
        this.channel.brightness = 255;
        //on
        ws2812x.render();
        await this.#delay(100);
        this.channel.brightness = 0;
        //off
        ws2812x.render();
        await this.#delay(100)
        this.channel.brightness = 255;
        //on
        ws2812x.render();
    }


    /**
     * setIdle will flash the LED's yellow every 3 seconds
     */
    async setIdle() {
        // clear and idle detections
        this.timeout = null;
        // clear the frame
        ws2812x.reset();
        // fill the first three LED's
        for (let i = 0; i < this.ledCount; i++) {
            this.ledStrip[i] = YELLOW;
        }

        // flash the LEDS yellow
        for (let i = 0; i < 3; i++) {
            this.channel.brightness = 0;
            ws2812x.render();
            await this.#delay(600);
            this.channel.brightness = 100;
            ws2812x.render();
            await this.#delay(600);

        }

        this.timeout = setTimeout(() => this.setIdle(), 3000);

    }
}

// lil debounce function
/**
 * Debounce will execute a given function after the specified debounce time. 
 * This is used for idle detection of CAN Bus
 * @param {(any => any)} func 
 * @param {null | number} timeout 
 * @returns 
 */
function debounce(func, timeout = 400) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

module.exports.LedController = LedController;
module.exports.debounce = debounce;
