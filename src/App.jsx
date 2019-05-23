import "@reach/tabs/styles.css";
import "@reach/tooltip/styles.css";
import "side-effects";
import {
    Link,
    LocationProvider,
    Redirect,
    Router,
    createHistory
} from "@reach/router";
import Players, {PlayerInfo, PlayerList} from "./components/players";
import {PlayersProvider, TournamentProvider} from "./state";
import {Tournament, TournamentList} from "./components/tournament";
import About from "./components/about";
import Caution from "./components/caution";
import Crosstable from "./components/tournament/crosstable";
import NotFound from "./components/404";
import {Options} from "./components/options";
import PlayerSelect from "./components/tournament/player-select";
import React from "react";
import Round from "./components/tournament/round";
import Scores from "./components/tournament/scores";
import TournamentIndex from "./components/tournament";
import createHashSource from "hash-source";
import {link} from "./App.module.css";
// These are just for deploying to GitHub pages.
let source = createHashSource();
let history = createHistory(source);

// const electron = window.require("electron");

function App() {
    return (
        <div className="app">
            <Caution />
            <LocationProvider history={history}>
                <header className="header">
                    <h1>
                        ♘ Chessahoochee: <small>a chess tournament app.</small>
                    </h1>
                    <nav>
                        <Link to="tourneys" className={link}>
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
                </header>
                <main className="content">
                    {/* Lots of nested contexts. Is there a better way? */}
                    <PlayersProvider>
                        <TournamentProvider>
                            <Router>
                                <TournamentIndex path="tourneys">
                                    <TournamentList path="/" />
                                    <Tournament path=":tourneyId">
                                        <PlayerSelect path="/" />
                                        <Crosstable path="crosstable" />
                                        <Scores path="scores" />
                                        <Round path=":roundId" />
                                    </Tournament>
                                </TournamentIndex>
                                <Players path="players">
                                    <PlayerList path="/"/>
                                    <PlayerInfo path=":playerId" />
                                </Players>
                                <Options path="options" />
                                <About path="about" />
                                <NotFound default />
                                <Redirect from="/" to="tourneys" noThrow />
                            </Router>
                        </TournamentProvider>
                    </PlayersProvider>
                </main>
            </LocationProvider>
        </div>
    );
}

export default App;
