import "side-effects";
import {
    Location,
    LocationProvider,
    Router,
    createHistory
} from "@reach/router";
import React, {useEffect, useState} from "react";
import TournamentIndex, {
    Tournament,
    TournamentList
} from "./components/tournament";
import Caution from "./components/caution";
import Icons from "./components/icons";
import NotFound from "./components/404";
import Options from "./components/options";
import Players from "./components/players";
import Splash from "./components/splash";
import VisuallyHidden from "@reach/visually-hidden";
import WindowsControls from "./components/windows-controls";
import classNames from "classnames";
import createHashSource from "hash-source";
import {useDocumentTitle} from "./hooks";
// These are just for deploying to GitHub pages.
let source = createHashSource();
let history = createHistory(source);

const electron = (window.require) ? window.require("electron") : false;
/**
 * https://github.com/electron/electron/issues/16385#issuecomment-453955377
 */
function macOSDoubleClick(event) {
    if (!electron) {
        return;
    }
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
        if (!win.isMaximized()) {
            win.maximize();
        } else {
            win.unmaximize();
        }
    }
};

function App() {
    useDocumentTitle("a chess tournament app");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isWindowBlur, setIsWindowBlur] = useState(false);
    useEffect(
        function () {
            if (!electron) {
                return;
            }
            const appWindow = electron.remote.getCurrentWindow();
            appWindow.on("enter-full-screen", () => setIsFullScreen(true));
            appWindow.on("leave-full-screen", () => setIsFullScreen(false));
            appWindow.on("blur", () => setIsWindowBlur(true));
            appWindow.on("focus", () => setIsWindowBlur(false));
            setIsFullScreen(appWindow.isFullScreen());
            setIsWindowBlur(!appWindow.isFocused());
        },
        []
    );
    return (
        <div
            className={classNames(
                "app",
                {"open-sidebar": isSidebarOpen},
                {"closed-sidebar": !isSidebarOpen},
                {"window-blur": isWindowBlur}
            )}
        >
            <LocationProvider history={history}>
                <header
                    className={classNames(
                        "header",
                        "double-click-control",
                        {"traffic-light-padding": (
                            navigator.appVersion.includes("Mac")
                            && electron
                            && !isFullScreen
                        )}
                    )}
                    onDoubleClick={macOSDoubleClick}
                >
                    <div>
                        <button
                            className="button-ghost"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            <Icons.Sidebar/>
                            <VisuallyHidden>Toggle sidebar</VisuallyHidden>
                        </button>
                        <Location>
                            {({location, navigate}) => (
                                <button
                                    className="button-ghost"
                                    disabled={location.pathname === "/"}
                                    onClick={() => navigate("/")}
                                >
                                    <Icons.Help />
                                    <VisuallyHidden>About</VisuallyHidden>
                                </button>
                            )}
                        </Location>
                    </div>
                    <div
                        className={classNames(
                            "body-20",
                            "double-click-control",
                            {"disabled": isWindowBlur}
                        )}
                        style={{
                            left: "0",
                            marginLeft: "auto",
                            marginRight: "auto",
                            position: "absolute",
                            right: "0",
                            width: "100px"
                        }}
                    >
                        Chessahoochee
                    </div>
                    {(navigator.appVersion.includes("Windows")) && electron &&
                        <WindowsControls />
                    }
                </header>
                <main className="main">
                    <Router>
                        <Splash path="/" />
                        <TournamentIndex path="tourneys">
                            <TournamentList path="/" />
                            <Tournament path=":tourneyId/*" />
                        </TournamentIndex>
                        <Players path="players/*" />
                        <Options path="options" />
                        <NotFound default />
                    </Router>
                </main>
            </LocationProvider>
            <footer className="footer">
                <Caution />
            </footer>
        </div>
    );
}

export default App;
