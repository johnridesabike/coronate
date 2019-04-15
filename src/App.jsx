// @ts-check
import React, { useState } from "react";
import "./App.css";
import {MainNav, NavItem} from "./jsx/utility.jsx";
import {createPlayerManager} from "./chess-tourney";
import {Players} from "./jsx/players.jsx";
import {TournamentList} from "./jsx/tournament.jsx";
import {Options} from "./jsx/options.jsx";
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
    const [currentView, setCurrentView] = useState(0);
    /** @param {number} id */
    const setViewList = (id) => setCurrentView(id);
    const viewList = [
        <Players playerManager={playerManager} />,
        <TournamentList playerManager={playerManager}
            tourneyList={tourneylist} setTourneyList={setTourneyList}
            openTourney={openTourney} setOpenTourney={setOpenTourney} />,
        <Options playerManager={playerManager} tourneyList={tourneylist}
            setTourneyList={setTourneyList} setOpenTourney={setOpenTourney} />
    ];
    return (
        <main>
            <MainNav>
                <NavItem name="Players"
                    action={() => setViewList(0)} isOpen={currentView === 0} />
                <NavItem name="Tournaments"
                    action={() => setViewList(1)} isOpen={currentView === 1} />
                <NavItem name="Options"
                    action={() => setViewList(2)} isOpen={currentView === 2} />
            </MainNav>
            {viewList[currentView]}
        </main>
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
