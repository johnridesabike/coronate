import "side-effects";
import {
    Link,
    LocationProvider,
    Router,
    createHistory
} from "@reach/router";
import React, {useState} from "react";
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
import classNames from "classnames";
import createHashSource from "hash-source";
import {link} from "./App.module.css";
import {useDocumentTitle} from "./hooks";
// These are just for deploying to GitHub pages.
let source = createHashSource();
let history = createHistory(source);

const electron = (window.require) ? window.require("electron") : false;

function App() {
    useDocumentTitle("a chess tournament app");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
                            navigator.appVersion.includes("Mac") && electron
                        )}
                    )}
                >
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <Icons.Sidebar/> Toggle sidebar
                    </button>
                    <span className="body-20">
                        Chessahoochee
                    </span>
                    <Link className={link} to="/">
                        About
                    </Link>
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
