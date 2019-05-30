/* eslint-disable fp/no-mutation */
const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require("path");
const isDev = require("electron-is-dev");

const photon = require("photon-colors");

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        backgroundColor: photon.GREY_10,
        // frame: false,
        height: 680,
        width: 900
        // webPreferences: {
        //     nodeIntegration: true
        // }
    });
    mainWindow.loadURL((
        (isDev)
        ? "http://localhost:3000"
        : `file://${path.join(__dirname, "../build/index.html")}`
    ));
    if (isDev) {
        const {
            default: installExtension,
            REACT_DEVELOPER_TOOLS
        } = require("electron-devtools-installer");

        installExtension(
            REACT_DEVELOPER_TOOLS
        ).then(
            (name) => console.log("Added Extension: ", name)
        ).catch(
            (err) => console.log("An error occurred: ", err)
        );
        // Open the DevTools.
        //BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on("closed", () => mainWindow = null);
}

if (process.env.PORTABLE_EXECUTABLE_DIR) {
    app.setPath(
        "userData",
        path.join(process.env.PORTABLE_EXECUTABLE_DIR, "data")
    );
}

app.on("ready", createWindow);

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", function () {
    if (mainWindow === null) {
        createWindow();
    }
});
