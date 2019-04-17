// @ts-check
import React, { useState } from "react";
import "./App.css";
// import {MainNav, NavItem} from "./jsx/utility.jsx";
import {createPlayerManager} from "./chess-tourney";
import {PlayerView} from "./jsx/players.jsx";
import {TournamentList} from "./jsx/tournament.jsx";
import {Options} from "./jsx/options.jsx";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import demoRoster from "./demo-players.json";
/**
 * @typedef {import("./chess-tourney").Tournament} Tournament
 */
function App() {
    /** @type {Tournament[]} */
    const initList = [];
    const [tourneylist, setTourneyList] = useState(initList);
    /** @type {Tournament | null} */
    const initOpen = null;
    const [openTourney, setOpenTourney] = useState(initOpen);
    const [playerManager] = useState(
        createPlayerManager(demoRoster)
    );
    // const [currentView, setCurrentView] = useState(0);
    // /** @param {number} id */
    // const setViewList = (id) => setCurrentView(id);
    // const viewList = [
    //     <PlayerView playerManager={playerManager} />,
    //     <TournamentList playerManager={playerManager}
    //         tourneyList={tourneylist} setTourneyList={setTourneyList}
    //         openTourney={openTourney} setOpenTourney={setOpenTourney} />,
    //     <Options playerManager={playerManager} tourneyList={tourneylist}
    //         setTourneyList={setTourneyList} setOpenTourney={setOpenTourney} />
    // ];
    return (
        <Tabs defaultIndex={1} className="app">
            <header  className="header">
                <TabList>
                    <Tab>Players</Tab>
                    <Tab>Tournaments</Tab>
                    <Tab>Options</Tab>
                </TabList>
            </header>
            <div className="body">
                <TabPanel>
                    <PlayerView playerManager={playerManager} />
                </TabPanel>
                <TabPanel>
                    <TournamentList
                        playerManager={playerManager}
                        tourneyList={tourneylist}
                        setTourneyList={setTourneyList}
                        openTourney={openTourney}
                        setOpenTourney={setOpenTourney} />
                </TabPanel>
                <TabPanel>
                    <Options
                        playerManager={playerManager}
                        tourneyList={tourneylist}
                        setTourneyList={setTourneyList}
                        setOpenTourney={setOpenTourney} />
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
