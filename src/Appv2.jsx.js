import React, { useState } from "react";
import "./App.css";
import {createPlayerManager} from "./chess-tourney";
import {Players, TournamentList} from "./chess-tourneyv2.jsx.js";
import demoRoster from "./demo-players.json";

// const defaultTournament = createTournament("CVL Winter Open");
const demoData = {playerData: demoRoster.slice(0,16)}

function App() {
    const [playerManager, setPlayerManager] = useState(
        createPlayerManager(demoData)
    );
    const [currentView, setCurrentView] = useState(0);
    const viewList = [
        <Players playerManager={playerManager} />,
        <TournamentList playerManager={playerManager} />
    ];
    const setViewList = (event) => setCurrentView(event.target.dataset.id);
    return (
        <main>
            <nav className="main-menu">
                <button data-id="0" onClick={setViewList}>
                    Players
                </button>
                <button data-id="1" onClick={setViewList}>
                    Tournaments
                </button>
            </nav>
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
