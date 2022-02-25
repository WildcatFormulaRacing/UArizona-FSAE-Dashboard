import "./index.css";
import $ from "jquery";
import {
    CarData,
    CarError,
    IPCEvents,
} from "./utils/dash-types";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { Tachometer } from "./components/Tachometer";
import { ErrorHandler } from "./components/ErrorHandler";
import { LedController } from "./components/LedController";

const gearContainer = $("#slot-center");
const rpmContainer = $("#slot-center-bottom");
const throttleText = $("#slot-value-left-1");
const coolantText = $("#slot-value-left-2");
const batteryText = $("#slot-value-right-1");
const lapText = $("#slot-value-right-2");
const errorContainerElem = $("#slot-error");
const errorTextElem = $(".error-text");
const ledController = new LedController(12, 21);

//@ts-expect-error
const canvas: HTMLCanvasElement = $("#canvas").get(0);
const tach = new Tachometer("#canvas", canvas.getContext("2d"));

// Error handler class
const errorHandler = new ErrorHandler(errorContainerElem, errorTextElem);
//////////// EVENTS ////////////
ipcRenderer.on(IPCEvents.DASH_ON, () => {
    // boot up the LED's
    ledController.test();
})

ipcRenderer.on(IPCEvents.CAR_DATA, (e: IpcRendererEvent, data: CarData) => {
    // fill text slots
    gearContainer.html(data.engineData.gear);
    rpmContainer.html(data.engineData.rpm);
    throttleText.html(data.engineData.throttlePosition);
    batteryText.html(data.engineData.batteryVoltage);
    coolantText.html(data.engineData.coolantTemp);
    lapText.html(data.lapData.currentLap);
    tach.setValue(parseInt(data.engineData.rpm));

});

/**
 * Sends any incoming errors to the error handler
 */
ipcRenderer.on(IPCEvents.CAR_ERROR, (e: IpcRendererEvent, error: CarError) => {
    // send the error to the error class
    errorHandler.setError(error);
});

/**
 * Disables any active errors
 */
ipcRenderer.on(IPCEvents.END_ERROR, () => {
    errorHandler.disableError();
})

