import "./index.css";
import $ from "jquery";
import {
    CarData,
    CarError,
    DashColors,
    IPCEvents,
    MAX_RPM,
} from "./utils/dash-types";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { linearScale } from "./utils/dash-utils";

const gearContainer = $("#slot-center");
const rpmContainer = $("#slot-center-bottom");
const throttleText = $("#slot-value-left-1");
const coolantText = $("#slot-value-left-2");
const batteryText = $("#slot-value-right-1");
const lapText = $("#slot-value-right-2");
const errorContainer = $("#slot-error");
const errorText = $(".error-text");

//@ts-expect-error
const canvas: HTMLCanvasElement = $("#canvas").get(0);
const ctx = canvas.getContext("2d");

//////////// EVENTS ////////////

ipcRenderer.on(IPCEvents.CAR_DATA, (e: IpcRendererEvent, data: CarData) => {
    // remove any disconnection warnings
    if (errorContainer.hasClass("visible")) {
        errorContainer.removeClass("visible");
    }

    // fill text slots
    gearContainer.html(data.engineData.gear);
    rpmContainer.html(data.engineData.rpm);
    throttleText.html(data.engineData.throttlePosition);
    batteryText.html(data.engineData.batteryVoltage);
    coolantText.html(data.engineData.coolantTemp);
    lapText.html(data.lapData.currentLap);

    // rev bar
    ctx.clearRect(0, 0, 760, 50);
    ctx.fillStyle = DashColors.GREY;
    ctx.fillRect(0, 0, 760, 51);

    // map 
    const fillWidth = linearScale(parseInt(data.engineData.rpm), 0, MAX_RPM, 0, 760);
    ctx.fillStyle = DashColors.ORANGE;
    ctx.fillRect(0, 0, fillWidth, 50);

    for (let x = 76; x < 760; x += (760 / 10)) {
        ctx.beginPath();
        ctx.moveTo(x, 15);
        ctx.lineTo(x, 30);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";
        ctx.stroke();
    }

});

ipcRenderer.on(IPCEvents.CAR_ERROR, (e: IpcRendererEvent, error: CarError) => {
    errorContainer.addClass("visible");
    errorText.html(error.msg);
});

