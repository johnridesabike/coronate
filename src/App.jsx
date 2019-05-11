import React from "react";
import {
    Router,
    Link,
    LocationProvider,
    createHistory
} from "@reach/router";
import createHashSource from "hash-source";
import About from "./components/about";
import NotFound from "./components/404";
import TournamentIndex from "./components/tournament";
import {TournamentList, Tournament} from "./components/tournament";
import Players, {PlayerList, PlayerInfo} from "./components/players";
import {Options} from "./components/options";
import Caution from "./components/caution";
import {DataProvider} from "./state/global-state";
import {PlayersProvider} from "./state/player-state";
import "./global.css";
// @ts-ignore
import {link} from "./App.module.css";
// These are just for deploying to GitHub pages.
let source = createHashSource();
// @ts-ignore
let history = createHistory(source);

function App() {
    return (
        <div className="app">
            <Caution />
            <LocationProvider history={history}>
                <nav className="header">
                    <Link to="/" className={link}>
                        Tournaments
                    </Link>
                    <Link to="players" className={link}>
                        Players
                    </Link>
                    <Link to="options" className={link}>
                        Options
                    </Link>
                    <Link to="about" className={link}>
                        About
                    </Link>
                </nav>
                <main className="content">
                    <PlayersProvider>
                        <DataProvider>
                            <Router>
                                <TournamentIndex path="/">
                                    <TournamentList path="/" />
                                    <Tournament path="tourney/:tourneyId" />
                                </TournamentIndex>
                                <Players path="players">
                                    <PlayerList path="/"/>
                                    <PlayerInfo path=":playerId" />
                                </Players>
                                <Options path="options" />
                                <About path="about" />
                                <NotFound default />
                            </Router>
                        </DataProvider>
                    </PlayersProvider>
                </main>
            </LocationProvider>
        </div>
    );
}

export default App;
