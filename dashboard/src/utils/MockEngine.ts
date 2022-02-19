import { CarData } from "./dash-types";
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
}