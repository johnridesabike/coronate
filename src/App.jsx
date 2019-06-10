import "./side-effects";
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
} from "./pages/tournament";
import {electron, ifElectron, macOSDoubleClick} from "./electron-utils";
import Caution from "./components/caution";
import Icons from "./components/icons";
import NotFound from "./components/404";
import Options from "./pages/options";
import Players from "./pages/players";
import Splash from "./pages/splash";
import VisuallyHidden from "@reach/visually-hidden";
import WindowsControls from "./components/windows-controls";
import classNames from "classnames";
import createHashSource from "hash-source";
import {useDocumentTitle} from "./hooks";
// These are just for deploying to GitHub pages.
let source = createHashSource();
let history = createHistory(source);

const isWindowsAndElectron = (
    navigator.appVersion.includes("Windows")
    && electron
);

function App() {
    useDocumentTitle("a chess tournament app");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isWindowBlur, setIsWindowBlur] = useState(false);
    useEffect(
        function () {
            ifElectron(function () {
                const win = electron.remote.getCurrentWindow();
                win.on("enter-full-screen", () => setIsFullScreen(true));
                win.on("leave-full-screen", () => setIsFullScreen(false));
                win.on("blur", () => setIsWindowBlur(true));
                win.on("focus", () => setIsWindowBlur(false));
                setIsFullScreen(win.isFullScreen());
                setIsWindowBlur(!win.isFocused());
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
                {"window-blur": isWindowBlur},
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
                            && !isFullScreen
                        )}
                    )}
                    onDoubleClick={macOSDoubleClick}
                >
                    <div>
                        {isWindowsAndElectron &&
                            <span
                                style={{
                                    alignItems: "center",
                                    display: "inline-flex",
                                    marginRight: "8px"}
                                }
                            >
                                <Icons.Logo/>
                            </span>
                        }
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
                    {isWindowsAndElectron &&
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
