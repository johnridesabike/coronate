import React from "react";
import {
    Router,
    Link,
    LocationProvider,
    createHistory,
    Redirect
} from "@reach/router";
import createHashSource from "hash-source";
import About from "./components/about";
import NotFound from "./components/404";
import TournamentIndex from "./components/tournament";
import {TournamentList, Tournament} from "./components/tournament";
import Players, {PlayerList, PlayerInfo} from "./components/players";
import Scores from "./components/tournament/scores";
import PlayerSelect from "./components/tournament/player-select";
import Crosstable from "./components/tournament/crosstable";
import Round from "./components/tournament/round";
import {Options} from "./components/options";
import Caution from "./components/caution";
import {OptionsProvider, TournamentProvider, PlayersProvider} from "./state";
import "side-effects";
import "@reach/tabs/styles.css";
import "@reach/tooltip/styles.css";
import "./global.css";
import {link} from "./App.module.css";
// These are just for deploying to GitHub pages.
let source = createHashSource();
let history = createHistory(source);

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
                    <OptionsProvider>
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
                    </OptionsProvider>
                </main>
            </LocationProvider>
        </div>
    );
}

export default App;
