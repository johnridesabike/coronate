import "./side-effects";
import {
    IfElectron,
    electron,
    ifElectron,
    macOSDoubleClick
} from "./electron-utils";
import {
    Location,
    LocationProvider,
    Router,
    createHistory
} from "@reach/router";
import React, {useEffect, useReducer, useState} from "react";
import TournamentIndex, {
    Tournament,
    TournamentList
} from "./pages/tournament";
import Icons from "./components/icons";
import NotFound from "./components/404";
import Options from "./pages/options";
import Players from "./pages/players";
import Splash from "./pages/splash";
import VisuallyHidden from "@reach/visually-hidden";
import WindowsControls from "./components/windows-controls";
import classNames from "classnames";
import createHashSource from "hash-source";
import logo from "./icon-min.svg";
import {useDocumentTitle} from "./hooks";
// These are just for deploying to GitHub pages.
let source = createHashSource();
let history = createHistory(source);

function windowReducer(oldState, newState) {
    return {...oldState, ...newState};
}

function App() {
    useDocumentTitle("a chess tournament app");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const initialWinState = {isBlur: false, isFullScreen: false};
    const [winState, winDispatch] = useReducer(windowReducer, initialWinState);
    useEffect(
        function addEventListeners() {
            ifElectron(function () {
                const win = electron.remote.getCurrentWindow();
                // This will ensure that stale event listeners aren't persisted.
                // That typically won't be relevant to production builds, but
                // in a dev environment, where the page reloads frequently,
                // stale listeners will accumulate. Note that this can cause
                // side effects if other listeners are added elsewhere.
                function unregisterListeners() {
                    win.removeAllListeners("enter-full-screen");
                    win.removeAllListeners("leave-full-screen");
                    win.removeAllListeners("blur");
                    win.removeAllListeners("focus");
                }
                unregisterListeners();
                // Add the event listeners. These will inform styling.
                win.on(
                    "enter-full-screen",
                    () => winDispatch({isFullScreen: true})
                );
                win.on(
                    "leave-full-screen",
                    () => winDispatch({isFullScreen: false})
                );
                win.on("blur", () => winDispatch({isBlur: true}));
                win.on("focus", () => winDispatch({isBlur: false}));
                winDispatch({isFullScreen: win.isFullScreen()});
                winDispatch({isBlur: !win.isFocused()});
                // I don't think this ever really fires, but can it hurt?
                return unregisterListeners;
            });
        },
        []
    );
    return (
        <div
            className={classNames(
                "app",
                {"open-sidebar": isSidebarOpen},
                {"closed-sidebar": !isSidebarOpen},
                {"window-blur": winState.isBlur},
                {"isWindows": navigator.appVersion.includes("Windows")},
                {"isElectron": electron}
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
                            && !winState.isFullScreen
                        )}
                    )}
                    onDoubleClick={macOSDoubleClick}
                >
                    <div>
                        <IfElectron onlyWin>
                            <span
                                style={{
                                    alignItems: "center",
                                    display: "inline-flex",
                                    marginLeft: "4px",
                                    marginRight: "8px"}
                                }
                            >
                                <img src={logo} alt="" height="16" width="16" />
                            </span>
                        </IfElectron>
                        <button
                            className="button-ghost"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            <Icons.Sidebar/>
                            <VisuallyHidden>Toggle sidebar</VisuallyHidden>
                        </button>
                        <Location>
                            {({location, navigate}) =>
                                <button
                                    className="button-ghost"
                                    disabled={location.pathname === "/"}
                                    onClick={() => navigate("/")}
                                >
                                    <Icons.Help />
                                    <VisuallyHidden>About</VisuallyHidden>
                                </button>
                            }
                        </Location>
                    </div>
                    <IfElectron>
                        <div
                            className={classNames(
                                "body-20",
                                "double-click-control",
                                {"disabled": winState.isBlur}
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
                    </IfElectron>
                    <IfElectron onlyWin><WindowsControls /></IfElectron>
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
            {/* <footer className="footer">
                <Caution />
            </footer> */}
        </div>
    );
}

export default App;
