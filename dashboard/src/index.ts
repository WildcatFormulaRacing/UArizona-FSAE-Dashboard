import { app, BrowserWindow, globalShortcut } from "electron";
import { CANChannel, CANEvents, CANMessage, CarError, DashColors, IPCEvents, PortOpenEvent, PORT_ALREADY_OPEN_ERR } from "./utils/dash-types";
import { decodeCAN } from "./utils/dash-utils";
import Logger from "electron-log";
import { MockEngine } from "./utils/MockEngine";

// socket can stuff
const can = require('socketcan');
// initalize the channel, this will be changed if mock mode is enabled
let channel = can.createRawChannel(CANChannel.CAN_BUS, true);

// if true port will be close and mock mode will be enabled
let mockMode = false;
let mockEngine: MockEngine;
//@ts-ignore, timeoutid for cancelling mock mode
let timeoutId = null;

// dashboard theme mode
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
// allows serial port to be used
app.allowRendererProcessReuse = false;
// allows the application to be ran as root
app.commandLine.appendArgument("--no-sandbox");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
    // eslint-disable-line global-require
    app.quit();
}

let mainWindow: BrowserWindow;

const createWindow = (): void => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        height: 480,
        width: 640,
        frame: false,
        webPreferences: {
            devTools: true,
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    // mainWindow.webContents.openDevTools();
    mainWindow.webContents.on("did-finish-load", () => {
        Logger.info("Dash On");
        mainWindow.webContents.send(IPCEvents.DASH_ON);
        connectToCan();
    });
};

/**
 * adds an event listener to the CAN interface, as well as a callback that
 * sends an IPC event of the car data back to the renderer
 */
const connectToCan = () => {
    // initalize the can listener
    channel.addListener(CANEvents.ON_MESSAGE, (msg: CANMessage) => {
        // decode the can message
        const data = decodeCAN(msg.data);
        // send the data to the renderer
        mainWindow.webContents.send(IPCEvents.CAR_DATA, data);
    })
}

/**
 * PRE-CONDITION: MOCK MODE MUST BE ENABLED
 * this will invoke the mockengine to send the next message through the virtual
 * CAN Bus (vcan0)
 */
const mockData = () => {
    // send the next line through vcan
    mockEngine.nextLine();
    //@TODO IMPLEMENT MOCK ERRORS

    // reinvoke this function every 15ms
    timeoutId = setTimeout(mockData, 15);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
    // register a shortcut for mock mode
    globalShortcut.register("Control+M", () => {
        // toggle mockMode
        mockMode = !mockMode;
        // invoke the mock function if we in fact are in mockMode
        if (mockMode) {
            Logger.info("MOCK MODE ENABLED");
            // disable any errors
            mainWindow.webContents.send(IPCEvents.END_ERROR);
            // create and set the mockEngine
            mockEngine = new MockEngine();
            // set the can channel to virtual can;
            channel = can.createRawChannel(CANChannel.VIRTUAL_CAN, true);
            // re-initalize the can listener
            connectToCan();
            // start the engine
            mockData();
        } else {
            Logger.info("MOCK MODE DISABLED");
            // reset everything back to real mode
            //@ts-ignore
            clearTimeout(timeoutId)
            timeoutId = null;
            mockEngine = null;
            // ressetting the can channel to real can
            channel = can.createRawChannel(CANChannel.CAN_BUS, true);
            // re-initalize the can listener
            connectToCan();
        }
    })

    createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
