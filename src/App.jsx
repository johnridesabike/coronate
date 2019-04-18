// @ts-check
import React, { useState, useEffect } from "react";
import "./App.css";
// import {MainNav, NavItem} from "./jsx/utility.jsx";
import {PlayerView} from "./jsx/players.jsx";
// import {TournamentList} from "./jsx/tournament.jsx";
// import {Options} from "./jsx/options.jsx";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import demoRoster from "./demo-players.json";
import createPlayer from "./chess-tourney-v2/player";
import { cleanAvoidList } from "./chess-tourney-v2/player-manager";
/**
 * @typedef {import("./chess-tourney").Tournament} Tournament
 */
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
        <Tabs defaultIndex={0} className="react-tabs app">
            <header className="header">
                <TabList>
                    <Tab>Players</Tab>
                    <Tab>Tournaments</Tab>
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
                    {/* <TournamentList
                        playerManager={playerManager}
                        tourneyList={tourneylist}
                        setTourneyList={setTourneyList}
                        openTourney={openTourney}
                        setOpenTourney={setOpenTourney} /> */}
                </TabPanel>
                <TabPanel>
                    {/* <Options
                        playerManager={playerManager}
                        tourneyList={tourneylist}
                        setTourneyList={setTourneyList}
                        setOpenTourney={setOpenTourney} /> */}
                </TabPanel>
            </div>
            <footer className="caution footer">
                <Caution />
            </footer>
        </Tabs>
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
