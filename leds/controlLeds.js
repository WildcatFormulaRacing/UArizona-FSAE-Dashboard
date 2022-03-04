/**
 * controlLeds.js
 * Listens to CAN Bus/Virtual CAN Bus events and lights up the LED strip accordingly
 * @NOTE Two important things, this is separate from the Dashboard app because
 * this MUST BE RAN AS ROOT. It is the only way to interface with the LED strip
 * because it needs to modify raw physical memory which can only be done
 * with an elevated user. Kinda sucks but its the way it is ¯\_(ツ)_/¯
 * 
 * @TODO possibly just convert this to some type of stream API so we can have more
 * control over the Leds
 */

const can = require('socketcan');
const { LedController, debounce } = require('./LedController');
const channel = can.createRawChannel('vcan0', true);
const RPM_MASK = BigInt('0xFFFF000000000000');

// create the controller
const ledController = new LedController(12, 21);
// run test
ledController.test();


/**
 * Debounce for Can Bus idle detection. This function is called after every
 * recieved input from can bus. However, it will only actually execute if 
 * 1 second has elapsed from the last time it was called. Hence there is radio
 * silence on can bus
 */
const setIdle = debounce(() => ledController.setIdle(), 1000);

channel.addListener('onMessage', (msg) => {
    // we only care about the rpm here
    const data = msg.data.readBigInt64BE();
    const rpm = Number((data & RPM_MASK) >> BigInt(48));
    // set the lights
    ledController.setRpm(rpm);

    // debounce
    setIdle();
});


// start idle detection
setTimeout(() => {
	setIdle();
}, 3000);

channel.start();
