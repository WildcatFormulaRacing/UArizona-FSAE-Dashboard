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
import { Tachometer } from "./components/Tachometer";

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
const tach = new Tachometer("#canvas", canvas.getContext("2d"));
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
    tach.setValue(parseInt(data.engineData.rpm));

});

ipcRenderer.on(IPCEvents.CAR_ERROR, (e: IpcRendererEvent, error: CarError) => {
    errorContainer.addClass("visible");
    errorText.html(error.msg);
});

