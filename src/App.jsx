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

function App() {
    useDocumentTitle("a chess tournament app");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);
    useEffect(
        function () {
            if (!electron) {
                return;
            }
            const appWindow = electron.remote.getCurrentWindow();
            appWindow.on("enter-full-screen", () => setIsFullScreen(true));
            appWindow.on("leave-full-screen", () => setIsFullScreen(false));
            setIsFullScreen(appWindow.isFullScreen());
        },
        []
    );

    /**
     * https://github.com/electron/electron/issues/16385#issuecomment-453955377
     */
    function macOSDoubleClick() {
        if (!electron) {
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
    return (
        <div
            className={classNames(
                "app",
                {"open-sidebar": isSidebarOpen},
                {"closed-sidebar": !isSidebarOpen}
            )}
        >
            <LocationProvider history={history}>
                <header
                    className={classNames(
                        "header",
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
                        className="body-20"
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
