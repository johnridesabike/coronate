import React, { useState } from "react";
import "./App.css";
import {MainNav, NavItem} from "./jsx/utility.jsx"
import {createPlayerManager} from "./chess-tourney";
import {Players} from "./jsx/players.jsx";
import {TournamentList} from "./jsx/tournament.jsx";
import {Options} from "./jsx/options.jsx";
import demoRoster from "./demo-players.json";

const demoData = {roster: demoRoster.slice(0,16)}

function App() {
    const [tourneylist, setTourneyList] = useState([]);
    const [openTourney, setOpenTourney] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [playerManager, setPlayerManager] = useState(
        createPlayerManager(demoData)
    );
    const [currentView, setCurrentView] = useState(0);
    const setViewList = (id) => setCurrentView(id);
    const viewList = [
        <Players playerManager={playerManager} />,
        <TournamentList playerManager={playerManager}
            tourneyList={tourneylist} setTourneyList={setTourneyList}
            openTourney={openTourney} setOpenTourney={setOpenTourney} />,
        <Options playerManager={playerManager} tourneyList={tourneylist}
            setTourneyList={setTourneyList} />
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
    // return (
    //     <div className="tournament">
    //     <nav className="tabbar">
    //         <ul>
    //         {tabList.map((tab, i) => 
    //             <li key={i}>
    //             <button
    //                 className="tab"
    //                 onClick={() => setCurrentTab(tab)}
    //                 disabled={currentTab === tab} >
    //                 {tab.name}
    //             </button>
    //             </li>
    //         )}
    //         <li>
    //             <button 
    //             className="tab new_round"
    //             onClick={newRound} >
    //             New Round
    //             </button>
    //         </li>
    //         </ul>
    //     </nav>
    //     <h1>Chessahoochee: a chess tournament app</h1>
    //     {currentTab.contents}
    //     </div>
    // );
}

function Caution() {
    return (
        <p>
            <span role="img" aria-label="waving hand">👋</span>&nbsp;
            This is an unstable demo build!
            Want to help make it better? Head to the&nbsp;
            <span role="img" aria-label="finger pointing right">👉</span>&nbsp;
            <a href="https://github.com/johnridesabike/chessahoochee">Git repository</a>.
        </p>
    );
}

export {App, Caution};
