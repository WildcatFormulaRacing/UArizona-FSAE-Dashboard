/**
 * not a .d.ts file because of enum ts bug
 */
export interface EngineData {
    rpm: string;
    speed: string;
    gear: string;
    throttlePosition: string;
    batteryVoltage: string;
    coolantTemp: string;
}

export interface LapData {
    currentLap: string;
}

export interface CarData {
    engineData: EngineData;
    lapData?: LapData;
}

/**
 * @param msg {string} - the message to display
 * @param status {number} - the error code number, for logging
 * @param color {DashColors} - the color that the text should be
 * @param expire {number} - the time in milliseconds that the msg should be disabled after
 */
export interface CarError {
    msg: string;
    status?: number;
    color?: DashColors;
    expire?: number;
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
    RED = "#fc0303",
    GREY = "#101010",
    ORANGE = "#ff8200"
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
    // Disables any ongoing car errors
    END_ERROR = "end-error"
}

// Entry Points
export const MAIN_ENTRY = "http://localhost:3000/main_window";
export const DIGITAL_ENTRY = "http://localhost:3000/digital";

// errors
export const PORT_ALREADY_OPEN_ERR = "Port is already open";
// in revolutions per minute
export const MAX_RPM = 12500;
// screen dimensions in pixels
export const SCREEN_WIDTH = 640;
export const SCREEN_HEIGHT = 480;


// Gauge Classes
/**
 * BaseGauge is the interface that all gauges will implement
 * contains the HTML id, the actual DOM html element, and a function
 * to set the value of that gauge
 */
export interface BaseGauge {
    id: string;
    element: JQuery<HTMLElement>;
    setValue(value: string): void;
}