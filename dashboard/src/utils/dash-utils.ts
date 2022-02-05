import { CarData } from "./dash-types";

export function decodeCAN(line: string): CarData {
	//
	const [
		rpm1,
		rpm2,
		throttlePosition,
		gear,
		batteryVoltage,
		coolant,
		upTime1,
		upTime2,
	] = line.split("\t");

	const real = Math.trunc((parseInt(rpm1) * 256 + parseInt(rpm2)) / 6);
    const realBattery = (parseInt(batteryVoltage) / 10).toFixed(1);
	// @NOTE: uptime is used a substitute for lap time right now
	const minutes = Math.floor(parseInt(upTime1) / 60);
	const seconds = parseInt(upTime1) % 60;
	const currLap = `${String(minutes).padStart(2, "0")}:${String(
		seconds
	).padStart(2, "0")}`;

	const carData: CarData = {
		engineData: {
			rpm: String(real),
			speed: "0",
			gear: gear === "0" ? "N" : gear,
			throttlePosition: throttlePosition,
			batteryVoltage: String(realBattery),
			coolantTemp: coolant,
		},
		lapData: {
			currentLap: currLap,
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
