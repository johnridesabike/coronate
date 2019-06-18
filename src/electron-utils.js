import PropTypes from "prop-types";
const electron = window.require ? window.require("electron") : false;
export {electron};

// Returns the result of a function if Electron is enabled.
export function ifElectron(fn) {
    return electron ? fn() : null;
}

// This is the JSX version of the previous function
export function IfElectron({children, onlyWin = false, onlyMac = false}) {
    const win = onlyWin ? navigator.appVersion.includes("Windows") : true;
    const mac = onlyMac ? navigator.appVersion.includes("Mac") : true;
    if ([electron, win, mac].includes(false)) {
        return null;
    } else {
        return children;
    }
}
IfElectron.propTypes = {
    children: PropTypes.node.isRequired,
    onlyMac: PropTypes.bool,
    onlyWindows: PropTypes.bool
};

function toggleMaximize(win) {
    if (!win.isMaximized()) {
        win.maximize();
    } else {
        win.unmaximize();
    }
}

// https://github.com/electron/electron/issues/16385#issuecomment-453955377
export function macOSDoubleClick(event) {
    ifElectron(function () {
        if (!event.target.className.includes) {
            return; // sometimes `className` isn't a string.
        }
        // We don't want double-clicking buttons to (un)maximize.
        if (!event.target.className.includes("double-click-control")) {
            return;
        }
        const {getUserDefault} = electron.remote.systemPreferences;
        const doubleClickAction = getUserDefault(
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
