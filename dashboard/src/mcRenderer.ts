import "./index.css";
import $ from "jquery";
import {
	CarData,
	CarError,
	ErrorEmitter,
	Slot,
	DashColors,
    IPCEvents,
    MAX_RPM,
} from "./utils/dash-types";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { linearScale } from "./utils/dash-utils";

const gearContainer = $("#slot-center");
const rpmContainer = $("#slot-center-bottom");
const errorContainer = $("#slot-error");
const errorText = $(".error-text");

//@ts-expect-error
const canvas: HTMLCanvasElement = $("#canvas").get(0);
const ctx = canvas.getContext("2d");

//////////// EVENTS ////////////

ipcRenderer.on("car-data", (e: IpcRendererEvent, data: CarData) => {
    if(errorContainer.hasClass("visible")) {
        errorContainer.removeClass("visible");
    }
    
    gearContainer.html(data.engineData.gear);
    rpmContainer.html(data.engineData.rpm);

    ctx.clearRect(0,0, 760, 50);
    ctx.fillStyle = "#101010";
    ctx.fillRect(0, 0, 760, 51);
    
    // map 
    const fillWidth = linearScale(parseInt(data.engineData.rpm), 0, MAX_RPM, 0, 760);
    ctx.fillStyle = "#ff8200";
    ctx.fillRect(0, 0, fillWidth, 50);
    
    for(let x = 76; x < 760; x += (760/10)) {
        ctx.beginPath();
        ctx.moveTo(x, 15);
        ctx.lineTo(x, 30);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";
        ctx.stroke();
    }

});

ipcRenderer.on("car-error", (e: IpcRendererEvent, error: CarError) => {
    errorContainer.addClass("visible");
    errorText.html(error.msg);
});

