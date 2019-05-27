import "@reach/tabs/styles.css";
import "@reach/tooltip/styles.css";
import "side-effects";
import {
    Link,
    LocationProvider,
    Router,
    createHistory
} from "@reach/router";
import TournamentIndex, {
    Tournament,
    TournamentList
} from "./components/tournament";
import About from "./components/about";
import Caution from "./components/caution";
import NotFound from "./components/404";
import Options from "./components/options";
import Players from "./components/players";
import React from "react";
import Splash from "./components/splash";
import createHashSource from "hash-source";
import {link} from "./App.module.css";
// These are just for deploying to GitHub pages.
let source = createHashSource();
let history = createHistory(source);

// const electron = window.require("electron");

function App() {
    return (
        <div className="app">
            <LocationProvider history={history}>
                <header className="header">
                    <nav>
                        <Link className={link} to="tourneys">
                            Tournaments
                        </Link>
                        <Link className={link} to="players">
                            Players
                        </Link>
                        <Link className={link} to="options">
                            Options
                        </Link>
                        <Link className={link} to="about">
                            About
                        </Link>
                    </nav>
                </header>
                <main className="content">
                    <Router>
                        <Splash path="/" />
                        <TournamentIndex path="tourneys">
                            <TournamentList path="/" />
                            <Tournament path=":tourneyId/*" />
                        </TournamentIndex>
                        <Players path="players/*" />
                        <Options path="options" />
                        <About path="about" />
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
