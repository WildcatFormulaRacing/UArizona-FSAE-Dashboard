import "./index.css";
import $ from "jquery";
import { CarData, CarError, DashColors, IPCEvents } from "./utils/dash-types";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { getLinePoints } from "./utils/dash-utils";

// Canvas
//@ts-expect-error
const backCanvas: HTMLCanvasElement = $("#base-canvas").get(0);
const backCtx = backCanvas.getContext("2d");

//@ts-expect-error
const animateCanvas: HTMLCanvasElement = $("#animation-canvas").get(0);
const animCtx = animateCanvas.getContext("2d");

/**
 * @todo caching might be a good situation here to prevent flickering of non-fatal
 * car errors
 */
ipcRenderer.on(IPCEvents.CAR_ERROR, (e: IpcRendererEvent, error: CarError) => {
	// clear error box
	animCtx.clearRect(450, 380, 400, 400);
	fillError(error.msg);
});

ipcRenderer.on(IPCEvents.DASH_ON, (e: IpcRendererEvent) => {
	backCtx.clearRect(0, 0, 800, 400);

	setCanvas();
});

ipcRenderer.on(IPCEvents.CAR_DATA, (e: IpcRendererEvent, data: CarData) => {
	// clear frame
	animCtx.clearRect(0, 0, 800, 480);

	// fill speed
	animCtx.strokeStyle = DashColors.GREEN;
	animCtx.font = "80px segment7";
	animCtx.strokeText(data.engineData.speed.padStart(3, "0"), 270, 250);
	fillTach(parseInt(data.engineData.rpm));
	fillGear(data.engineData.gear);
});

////// helper functions ///////

////// init canvas ///////////
function setTach() {
	// setup inital tachometer
	const points = getLinePoints(50);
	backCtx.globalAlpha = 0.3;
	backCtx.beginPath();
	backCtx.moveTo(60, 312);
	backCtx.lineWidth = 10;

	points.forEach(([x, y]) => {
		backCtx.lineTo(x, y);
	});
	backCtx.strokeStyle = DashColors.GREEN;
	backCtx.stroke();

	// reset widths and opacity
	backCtx.globalAlpha = 0.99;
	backCtx.lineWidth = 1;

	// set the text
	backCtx.font = "15px strasua";
	backCtx.strokeText("TACHO   x1000r/min", 100, 312);

	// tach numbers
	const numPoints = getLinePoints(10);
	backCtx.font = "20px sans-serif italics";
	numPoints.forEach(([x, y], idx: number) => {
		// x and y offsets, move x back and y up
		const xOffset = 10;
		const yOffset = 20;
		backCtx.strokeText(String(idx), x - xOffset, y - yOffset);
	});

	backCtx.beginPath();
	backCtx.moveTo(40, 230);
	backCtx.lineTo(100, 230);
	backCtx.moveTo(130, 230);
	backCtx.lineTo(230, 230);
	backCtx.stroke();

	backCtx.font = "15px strasua";
	backCtx.strokeText("SPEED", 190, 250);
}

function setOilTemp() {
	//container
	backCtx.beginPath();
	backCtx.rect(565, 175, 50, 100);
	backCtx.stroke();

	//outline the segments
	backCtx.beginPath();
	backCtx.fillStyle = DashColors.GREEN;
	for (let y = 175; y < 275; y += 10) {
		if (y < 200) {
			backCtx.fill();
		}
		backCtx.rect(565, y, 50, 10);
	}
	backCtx.stroke();

	//draw indicate line
	backCtx.beginPath();
	backCtx.moveTo(480, 230);
	backCtx.lineTo(560, 230);
	backCtx.stroke();

	backCtx.font = "10px strasua";
	backCtx.strokeText("OIL TEMP", 568, 290);
}

function setBatteryIndicator() {
	const width = 20;
	const height = 30;
	const startX = 675;

	// 6 battery bars, first two are red
	backCtx.fillStyle = DashColors.RED;
	// starting point until 5
	for (let x = startX; x < startX + width * 3; x += width + 5) {
		// lazy
		if (x > 690) {
			backCtx.fillStyle = DashColors.GREEN;
		}
		backCtx.fillRect(x, 215, width, height);
	}

	// text
	backCtx.strokeStyle = DashColors.GREEN;
	backCtx.font = "25px segment7";
	backCtx.strokeText("12.00 V", 670, 275);

	backCtx.font = "10px strasua";
	backCtx.strokeText("BATT VOLT.", 680, 290);
}

function setCanvas() {
	// fill black background
	backCtx.fillStyle = "black";
	backCtx.fillRect(0, 0, 800, 480);

	// set the tach
	setTach();
	// set oil temp indicator
	setOilTemp();
	// set battery indicator
	setBatteryIndicator();

	// speed text
	backCtx.font = "15px strasua";
	backCtx.strokeStyle = DashColors.GREEN;
	backCtx.strokeText("KMH", 400, 200);

	// gear text
	backCtx.beginPath();
	backCtx.moveTo(500, 70);
	backCtx.lineTo(560, 70);
	backCtx.moveTo(615, 70);
	backCtx.lineTo(675, 70);
	backCtx.stroke();
	backCtx.font = "15px strasua";
	backCtx.strokeText("Gear", 615, 85);

	// lap info text
	backCtx.strokeText("Lap", 150, 430);
	backCtx.strokeText("Delta", 300, 430);

	// filler text
	backCtx.font = "30px segment7";
	backCtx.strokeText("00:00", 132, 400);
	backCtx.strokeText("+00.00", 275, 400);
}

/////// animation canvas /////////
function fillTach(rpm: number) {
	// map the rpm to pixel coordinates
	//@TODO change so it fits actual car limits
	const maxVal = ((rpm - 0) * (425 - 60)) / (11500 - 0 + 60);
	const path = getLinePoints(50, maxVal);

	// draw the line
	animCtx.globalAlpha = 1;
	animCtx.beginPath();
	animCtx.lineWidth = 8;
	animCtx.moveTo(60, 312);

	path.forEach(([x, y]) => {
		animCtx.lineTo(x, y);
	});
	animCtx.setLineDash([2, 2]);
	animCtx.strokeStyle =
		rpm > 10200 && rpm < 11000
			? DashColors.YELLOW
			: rpm > 11000
			? DashColors.RED
			: DashColors.GREEN;
	animCtx.stroke();

	//reset line width and dash
	animCtx.lineWidth = 1;
	animCtx.setLineDash([]);
}

function fillGear(gear: string) {
	//565
	// clear box
	animCtx.font = "80px segment7";
	animCtx.strokeStyle = DashColors.GREEN;
	animCtx.strokeText(gear, 565, 100);
}

function fillError(msg: string) {
	// write error in red
	animCtx.strokeStyle = DashColors.RED;
	animCtx.font = "30px segment7";
	animCtx.strokeText(msg, 450, 425);
}
