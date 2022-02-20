import { app, BrowserWindow, globalShortcut } from "electron";
import { CarError, DashColors, IPCEvents, PortOpenEvent, PORT_ALREADY_OPEN_ERR } from "./utils/dash-types";
import { decodeCAN } from "./utils/dash-utils";
import Logger from "electron-log";
import { MockEngine } from "./utils/MockEngine";

// dashboard theme mode
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;

// serial port inital
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SerialPort = require("serialport");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Readline = require("@serialport/parser-readline");
// if true port will be close and mock mode will be enabled
let mockMode = false;
let mockEngine: MockEngine;
//@ts-ignore, timeoutid for cancelling mock mode
let timeoutId = null;

//@TODO make this dynamic
const PORT = "/dev/ttyACM0";
const BAUDRATE = 115200;
const port = new SerialPort(PORT, {
    autoOpen: false,
    baudRate: BAUDRATE,
});
const parser = port.pipe(new Readline({ delimiter: "\n" }));

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
        // only connect if we are not in mock mode
        if (!mockMode) {
            connectToCan();
        }
    });
};

const connectToCan = () => {
    port.open((err: PortOpenEvent) => {
        // if there was no err, port opened successfully
        // special exception for if it tries to open the port when its already
        // open, this usually happens during a dash switch, but is dealed with here
        if (!err || err.message === PORT_ALREADY_OPEN_ERR || mockMode) return;

        // close events will be considered a fatal error
        const carErr: CarError = {
            status: 500,
            msg: "CAN BUS DISCONNECTION",
            color: DashColors.RED,
            expire: 1000
        };

        mainWindow.webContents.send(IPCEvents.CAR_ERROR, carErr);
        // start timeout loop to retry connection
        setTimeout(() => connectToCan(), 2000);
    });
};

const mockData = () => {
    // get the next line and send it to the renderer
    const dat = mockEngine.nextLine();
    mainWindow.webContents.send(IPCEvents.CAR_DATA, dat);
    // .1% chance of simulating an error
    if (Math.random() < 0.001) {
        const err = mockEngine.simulateError();
        mainWindow.webContents.send(IPCEvents.CAR_ERROR, err);
    }

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
            mockData();
        } else {
            Logger.info("MOCK MODE DISABLED");
            // garbage
            //@ts-ignore
            clearTimeout(timeoutId)
            timeoutId = null;
            mockEngine = null;
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

////////// EVENTS /////////////
port.on("open", () => {
    port.resume();
});

port.on("close", () => {
    // we want to ignore any close events if mockmode is enabled
    if (!mockMode) {
        connectToCan();
    }
});

parser.on("data", (line: string) => {
    const carData = decodeCAN(line);
    Logger.info(line);
    // give to render
    mainWindow.webContents.send(IPCEvents.CAR_DATA, carData);
});
