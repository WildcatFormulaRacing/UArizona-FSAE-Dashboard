import { BATTERY_MASK, CarData, COOLANT_MASK, GEAR_MASK, RPM_MASK, THROTTLE_MASK, UPTIME_MASK } from "./dash-types";

export function decodeCAN(buff: Buffer): CarData {
    // read the 64 bits
    const data = buff.readBigInt64LE();
    // perform the masks @NOTE we are also converting these bigints back to normal
    // 4 byte integers, because we know that they are within the size range for int
    // there's no reason to use up the memory to store the big bois here
    const rpm = Number((data & RPM_MASK) >> BigInt(48));
    const throttle = Number((data & THROTTLE_MASK) >> BigInt(40));
    const gear = Number((data & GEAR_MASK) >> BigInt(32));
    const battery = Number((data & BATTERY_MASK) >> BigInt(24));
    const coolant = Number((data & COOLANT_MASK) >> BigInt(16));
    //@TODO fix this so it splits up the time
    const upTime = Number((data & UPTIME_MASK));

    // convert to volts
    const realBattery = (battery / 10).toFixed(1);

    const carData: CarData = {
        engineData: {
            rpm: String(rpm),
            speed: "0",
            gear: gear === 0 ? "N" : String(gear),
            throttlePosition: String(throttle),
            batteryVoltage: String(realBattery),
            coolantTemp: String(coolant),
        },
        lapData: {
            currentLap: "00:00",
        },
    };

    return carData;
}

/**
 * Returns a 2d array with n amount of coordinates outlining points on the
 * tachometer
 * @param n {number} - amount of data points
 */
export function getLinePoints(n: number, max?: number) {
    max = max ?? 425;
    // 3rd order polynomial a + bx + cx^2 + dx^3
    const f = (x: number) => {
        const a = 446.03;
        const b = -2.56;
        const c = 0.0058;
        const d = -0.0000039;

        return a + b * x + c * Math.pow(x, 2) + d * Math.pow(x, 3);
    };

    // start:   coord (60, 312)
    // end:     coord (485, 120)
    const path = [];
    for (let x = 60; x < max; x += max / n) {
        path.push([x, f(x)]);
    }

    return path;
}

export function linearScale(
    x: number,
    in_min: number,
    in_max: number,
    out_min: number,
    out_max: number
) {
    return ((x - in_min) * (out_max - out_min)) / (in_max - in_min + out_max);
}
