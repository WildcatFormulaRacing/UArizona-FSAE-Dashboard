/**
 * not a .d.ts file because of enum ts bug
 */
export interface EngineData {
	rpm: string;
	speed: string;
	gear: string;
    throttlePosition: string;
}

export interface LapData {
	currentLap: string;
	lapDelta: string;
}

export interface CarData {
	engineData: EngineData;
	lapData?: LapData;
}

export interface CarError {
	status: number;
	msg: string;
	fatal: boolean;
}

export interface PortOpenEvent {
	message?: string;
}

export interface Slot {
	text: JQuery<HTMLElement>;
	// optional because center element doesn't have a label
	label?: JQuery<HTMLElement>;
}

export interface ErrorEmitter {
	container: JQuery<HTMLElement>;
	message: JQuery<HTMLElement>;
}

export enum DashColors {
	GREEN = "#06e514",
	YELLOW = "#ecff51",
	RED = "#fc036f",
}

//Events
// car event should be changed to the approiate bitmap once CAN is implemented
export enum IPCEvents {
    // for regular CAN events
    CAR_DATA = "car-data",
    // for irregular CAN events
    CAR_ERROR = "car-error",
    // one time event call for finished DOM load
    DASH_ON = "dash-on",
}

// Entry Points
export const MAIN_ENTRY = "http://localhost:3000/main_window";
export const DIGITAL_ENTRY = "http://localhost:3000/digital";

// errors
export const PORT_ALREADY_OPEN_ERR = "Port is already open";

export const MAX_RPM = 12500;