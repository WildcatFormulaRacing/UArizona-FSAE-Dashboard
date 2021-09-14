import "./index.css";
import $ from "jquery";
import { CarData, CarError, ErrorEmitter, Slot } from "./utils/dash-types";
import { ipcRenderer, IpcRendererEvent } from "electron";

// SLOTS
const tlSlot: Slot = {
	text: $("#slot-tl-text"),
	label: $("#slot-tl-label"),
};
const trSlot: Slot = {
	text: $("#slot-tr-text"),
	label: $("#slot-tr-label"),
};
const blSlot: Slot = {
	text: $("#slot-bl-text"),
	label: $("#slot-br-label"),
};
const brSlot: Slot = {
	text: $("#slot-br-text"),
	label: $("#slot-br-label"),
};
const centerSlot: Slot = {
	text: $("#slot-center-text"),
};

// Error Emitter
const errorEmitter: ErrorEmitter = {
	container: $("#error-emitter-container"),
	message: $("#error-emitter-message"),
};

//////////// EVENTS ////////////

ipcRenderer.on("car-data", (e: IpcRendererEvent, data: CarData) => {
	if (errorEmitter.container.hasClass("visible")) {
		errorEmitter.container.removeClass("visible");
	}

    //color check
    if (parseInt(data.engineData.rpm) > 10500) {
        trSlot.text.addClass('red');
        tlSlot.text.addClass('red');
        centerSlot.text.addClass('red');
    } else {
        trSlot.text.removeClass('red');
        tlSlot.text.removeClass('red');
        centerSlot.text.removeClass('red');
    }
	// gear
	centerSlot.text.html(data.engineData.gear);

	// rpm
	tlSlot.text.html(data.engineData.rpm);
	tlSlot.label.html("RPM");

	//speed
	trSlot.text.html(data.engineData.speed);
	trSlot.label.html("KPH");
});

ipcRenderer.on("car-error", (e: IpcRendererEvent, error: CarError) => {
    if (!errorEmitter.container.hasClass("visible")) {
		errorEmitter.container.addClass("visible");
	}
	errorEmitter.message.html(error.msg);
});
