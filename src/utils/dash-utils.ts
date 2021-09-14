import { CarData } from "./dash-types";

export function decodeCAN(line: string) : CarData {
    const [rpm, speed, gear] = line.split('\t');

    const carData : CarData = {
        engineData: {
            rpm: rpm,
            speed: speed,
            gear: gear === "0" ? "N" : gear
        }
    }

    return carData
}