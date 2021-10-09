import { app, BrowserWindow, globalShortcut } from "electron";
import { CarError, IPCEvents, PortOpenEvent, PORT_ALREADY_OPEN_ERR } from "./utils/dash-types";
import { decodeCAN } from "./utils/dash-utils";
import { MAIN_ENTRY, DIGITAL_ENTRY } from "./utils/dash-types";

// dashboard theme mode
let currentMode = MAIN_ENTRY;

// serial port inital
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SerialPort = require("serialport");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Readline = require("@serialport/parser-readline");

//@TODO make this dynamic
const PORT = "COM3";
const BAUDRATE = 9600;
const port = new SerialPort(PORT, {
	autoOpen: false,
	baudRate: BAUDRATE,
});
const parser = port.pipe(new Readline({ delimiter: "\n" }));

// allows serial port to be used
app.allowRendererProcessReuse = false;

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
		width: 800,
		frame: false,
		webPreferences: {
			devTools: true,
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	// and load the index.html of the app.
	mainWindow.loadURL(MAIN_ENTRY);
	// mainWindow.webContents.openDevTools();
	mainWindow.webContents.on("did-finish-load", () => {
		console.log("Dash on sent");
		mainWindow.webContents.send(IPCEvents.DASH_ON);
		connectToCan();
	});
};

const connectToCan = () => {
	port.open((err: PortOpenEvent) => {
		// if there was no err, port opened successfully
        // special exception for if it tries to open the port when its already
        // open, this usually happens during a dash switch, but is dealed with here
		if (!err || err.message === PORT_ALREADY_OPEN_ERR) return;
        
		// close events will be considered a fatal error
		const carErr: CarError = {
			status: 500,
			msg: "CAN BUS DISCONNECTION",
			fatal: true,
		};

		mainWindow.webContents.send(IPCEvents.CAR_ERROR, carErr);
		// start timeout loop to retry connection
		setTimeout(() => connectToCan(), 2000);
	});
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
	createWindow();
	// register dashboard view switch, for now it'll be the 'd' key on the keyboard
	// @TODO change it to a CAN event when CAN is setup so it can be controlled
	// from the steering wheel.
	globalShortcut.register("CommandOrControl+D", async () => {
		// switch the dash
		currentMode = currentMode === MAIN_ENTRY ? DIGITAL_ENTRY : MAIN_ENTRY;
		// close serialport, it seems to bug out if we dont. Also we have to wait
        // until the port is actually closed, port.close() takes callsback when
        // its closed so that's why we're using async here
		await port.close();
		console.log("loading");
		mainWindow.loadURL(currentMode);
		port.open();
	});
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
	connectToCan();
});

parser.on("data", (line: string) => {
	const carData = decodeCAN(line);

	// give to render
	mainWindow.webContents.send(IPCEvents.CAR_DATA, carData);
});
