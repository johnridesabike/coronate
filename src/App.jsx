// @ts-check
import React, { useState, useEffect } from "react";
import "./App.css";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import demoRoster from "./demo-players.json";
import createPlayer from "./chess-tourney-v2/player";
import { cleanAvoidList } from "./chess-tourney-v2/player-manager";
import {TournamentList} from "./jsx/tournament";
import {PlayerView} from "./jsx/players.jsx";

function App() {
    // /** @type {Tournament[]} */
    // const initList = [];
    // const [tourneylist, setTourneyList] = useState(initList);
    // /** @type {Tournament | null} */
    // const initOpen = null;
    // const [openTourney, setOpenTourney] = useState(initOpen);
    const [playerList, setPlayerList] = useState(
        demoRoster.playerList.map((p) => createPlayer(p))
    );
    const [avoidList, setAvoidList] = useState(demoRoster.avoidList);
    useEffect(function () {
        // remove stale IDs
        setAvoidList(cleanAvoidList(avoidList, playerList));
    }, [playerList]);
    return (
        <React.StrictMode>
        <Tabs defaultIndex={0} className="react-tabs app">
            <header className="header">
                <TabList>
                    <Tab>Players</Tab>
                    <Tab>Tournament</Tab>
                    <Tab>Options</Tab>
                </TabList>
            </header>
            <div className="body">
                <TabPanel>
                    <PlayerView
                        playerList={playerList}
                        setPlayerList={setPlayerList}
                        avoidList={avoidList}
                        setAvoidList={setAvoidList}/>
                </TabPanel>
                <TabPanel>
                    <TournamentList playerList={playerList} />
                </TabPanel>
                <TabPanel>
                    <p>
                        Coming soon.
                    </p>
                </TabPanel>
            </div>
            <footer className="caution footer">
                <Caution />
            </footer>
        </Tabs>
        </React.StrictMode>
    );
}

function Caution() {
    return (
        <p>
            <span role="img" aria-label="waving hand">👋</span>&nbsp;
            This is an unstable demo build!
            Want to help make it better? Head to the&nbsp;
            <span role="img" aria-label="finger pointing right">👉</span>&nbsp;
            <a href="https://github.com/johnridesabike/chessahoochee">
                Git repository
            </a>.
        </p>
    );
}

export {App, Caution};
