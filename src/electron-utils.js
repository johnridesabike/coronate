const electron = (window.require) ? window.require("electron") : false;
export {electron};

export function ifElectron(fn) {
    if (electron) {
        fn();
    }
}

/**
 * https://github.com/electron/electron/issues/16385#issuecomment-453955377
 */
function toggleMaximize(win) {
    if (!win.isMaximized()) {
        win.maximize();
    } else {
        win.unmaximize();
    }
}

export function macOSDoubleClick(event) {
    ifElectron(function () {
        if (!event.target.className.includes) {
            return; // sometimes `className` isn't a string.
        }
        // We don't want double-clicking buttons to (un)maximize.
        if (!event.target.className.includes("double-click-control")) {
            return;
        }
        const systemPrefs = electron.remote.systemPreferences;
        const doubleClickAction = systemPrefs.getUserDefault(
            "AppleActionOnDoubleClick",
            "string"
        );
        const win = electron.remote.getCurrentWindow();
        if (doubleClickAction === "Minimize") {
            win.minimize();
        } else if (doubleClickAction === "Maximize") {
            toggleMaximize(win);
        }
    });
};
