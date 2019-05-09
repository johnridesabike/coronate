import React, {useReducer} from "react";
import {
    Router,
    Link,
    Location,
    LocationProvider,
    createHistory
} from "@reach/router";
import createHashSource from "hash-source";
import classnames from "classnames";
import TournamentList from "./components/tournament/list";
import Players from "./components/players/index";
import PlayerList from "./components/players/list";
import PlayerInfo from "./components/players/info-box";
import {Options} from "./components/options";
import Caution from "./components/caution";
import {defaultData, dataReducer, DataContext} from "./state/global-state";
import Tournament from "./components/tournament/tournament";
import "./global.css";
// @ts-ignore
import {link, current} from "./App.module.css";
// These are just for deploying to GitHub pages.
let source = createHashSource();
// @ts-ignore
let history = createHistory(source);

/**
 * @param {import("@reach/router").WindowLocation} location
 * @param {string} path
 */
function linkClasses(location, path) {
    const isCurrent = (
        location.pathname === path || location.pathname.slice(1) === path
    );
    return classnames(
        link,
        {[`${current}`]: isCurrent}
    );
}

/**
 * @param {Object} props
 */
const About = (props) => (
    <p>
        This is an early, proof-of-concept, demo of a
        chess tournament manager.{" "}
        <a href="https://github.com/johnridesabike/chessahoochee">
        You can find out more here.</a>
    </p>
);

function App() {
    const [data, dispatch] = useReducer(dataReducer, defaultData);
    return (
        <div className="app">
            <Caution />
            <LocationProvider history={history}>
                <Location>
                    {({location}) => (
                        <nav className="header">
                            <Link
                                to="/"
                                className={linkClasses(location, "/")}
                            >
                                Tournaments
                            </Link>
                            <Link
                                to="players"
                                className={linkClasses(location, "players")}
                            >
                                Players
                            </Link>
                            <Link
                                to="options"
                                className={linkClasses(location, "options")}
                            >
                                Options
                            </Link>
                            <Link
                                to="about"
                                className={linkClasses(location, "about")}
                            >
                                About
                            </Link>
                        </nav>
                    )}
                </Location>
                <main className="content">
                    <DataContext.Provider value={{data, dispatch}}>
                        <Router>
                            <TournamentList path="/" />
                            <Players path="players">
                                <PlayerList path="/"/>
                                <PlayerInfo path=":playerId" />
                            </Players>
                            <Options path="options" />
                            <About path="about" />
                            <Tournament path="tourney/:tourneyId" />
                        </Router>
                    </DataContext.Provider>
                </main>
            </LocationProvider>
        </div>
    );
}

export default App;
