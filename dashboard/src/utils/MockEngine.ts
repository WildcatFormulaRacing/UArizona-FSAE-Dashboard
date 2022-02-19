import { CarData, CarError, DashColors } from "./dash-types";
import { decodeCAN } from "./dash-utils";
const mockEngineData = require("./mockEngineData.json");

export class MockEngine {
    // the mock data array
    private mockData: string[];
    // the current point in time of the engine
    private currPointer: number;

    constructor() {
        // load in the mock data and set the pointer to 0
        //@ts-ignore
        this.mockData = mockEngineData;
        this.currPointer = 0;
    }

    /**
     * reads the next line in the from the mock data and returns a CarData Object
     */
    nextLine(): CarData {
        // load the car data
        const carData = decodeCAN(this.mockData[this.currPointer]);
        // increment or reset the pointer
        if(this.currPointer < this.mockData.length - 1) {
            this.currPointer++;
        } else {
            this.currPointer = 0;
        }
        
        // return the car data
        return carData;
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