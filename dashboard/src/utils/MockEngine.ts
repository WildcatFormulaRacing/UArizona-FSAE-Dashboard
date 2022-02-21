import { CANChannel, CANMessage, CarData, CarError, DashColors } from "./dash-types";

const can = require('socketcan');
const mockEngineData = require("./mockEngineData.json");

export class MockEngine {
    // the mock data array
    private mockData: string[];
    // the current point in time of the engine
    private currPointer: number;
    // Woah any type?? yeah, socketcan doesn't have any typings :(
    private channel: any;

    constructor() {
        // load in the mock data and set the pointer to 0
        //@ts-ignore
        this.mockData = mockEngineData;
        this.currPointer = 0;

        // @NOTE super important, all mock messages will be sent though a virutal
        // can bus called vcan0
        this.channel = can.createRawChannel(CANChannel.VIRTUAL_CAN, true);
        this.channel.start();
    }

    /**
     * reads the next line in the from the mock data and returns a CarData Object
     */
    nextLine(): void {
        // gets the next reading
        const nextLine = this.mockData[this.currPointer];
        // read in the next line of the data and convert it to an 8 byte buffer
        const buff = Buffer.from(nextLine);
        // @TODO use real can id
        const msg : CANMessage = {
            id: 500,
            data: buff
        }

        // increment or reset the pointer
        if(this.currPointer < this.mockData.length - 1) {
            this.currPointer++;
        } else {
            this.currPointer = 0;
        }
        
        // send the message through virtual can
        this.channel.send(msg);
    }

    /**
     * Generates a random error
     * @NOTE this error will always have an expire time of 3 seconds
     */
    simulateError() : CarError {
        const colors = [DashColors.GREEN, DashColors.YELLOW, DashColors.RED];
        const errorMsgs = [
            "Uh oh stinky 🙊",
            "Car breaking 🥵",
            "It's probably the alternator 👽",
            "ERROR: 🧍‍♂️",
            "Car is hot 🤔😓😫😩",
            "Low Fuel ⛽🐛"
        ];

        // pick a random error message and a random color
        const carErr : CarError = {
            msg: errorMsgs[Math.floor(Math.random() * errorMsgs.length)],
            color: colors[Math.floor(Math.random() * colors.length)],
            expire: 3000
        }

        return carErr;
    }
}