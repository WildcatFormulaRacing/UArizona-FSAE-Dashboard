import { LedOptions, LedColors } from "../utils/dash-types";
const ws2812x = require('@gbkwiatt/node-rpi-ws281x-native');

export class LedController {
    // amount of LED's to light up
    private trueLedCount: number;
    /**
     * the revbar is split up into 3 equal 'sections, defined by
     * floor(ledCount / 3). For ex. if we have 20 LED's there will be
     * three sections of 6, thus only 18 LED's will actually light up
     */
    private sectionSize: number;
    // actual amount of LED's that will light up
    private ledStripSize: number;
    // actual led controller
    private ledStrip: Uint32Array;
    // The led channel, lets us control the brightness and other goods
    private channel: any;
    // gpio data pin
    private gpioPin: number;

    /**
     * Constructs an instance of LedController
     * @param ledCount {number} - amount of LED's in the strip
     * @param gpioPin {number} - the data pin that the LED's are connected to
     */
    constructor(ledCount: number, gpioPin: number, options?: LedOptions) {
        this.trueLedCount = ledCount;
        this.sectionSize = Math.floor(this.trueLedCount / 3);
        this.ledStripSize = this.sectionSize * 3;

        this.gpioPin = gpioPin;
        // create the ws2812 controller
        this.channel = ws2812x(this.trueLedCount, {
            // default options will be overwritten if options is passed in
            ...options,
            gpio: this.gpioPin,
            brightness: 255,
            stripType: 'ws2812',
            invert: false
        });

        this.ledStrip = this.channel.array;
    }

    /**
     * Delay function provides a safe non-blocking way to delay for a given
     * amount of ms. This should only be used in preset animations. For drawing
     * 'frames' on the LED's we should be using the rate at which we recieve
     * can data, or Node's process.tick's.
     * @param ms 
     */
    private delay(ms: number): Promise<void> {
        return new Promise(res => setTimeout(res, ms));
    }

    /**
     * runs a small animation to test the LED's
     *
     */
    async test(): Promise<void> {
        // light up the LED's one at a time
        for (let pix = 0; pix < this.ledStripSize; pix++) {
            if (pix < this.sectionSize) {
                // green lights
                this.ledStrip[pix] = LedColors.GREEN;
            } else if (pix >= this.sectionSize && pix < this.sectionSize * 2) {
                // blue lights
                this.ledStrip[pix] = LedColors.BLUE;
            } else {
                this.ledStrip[pix] = LedColors.RED;
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
        for(let i = 0; i < 5; i++) {
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
}