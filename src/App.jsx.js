import React, { useState } from "react";
import "./App.css";
import {createTournament} from "./chess-tourney";
import {MainRoster, Round} from "./chess-tourney.jsx.js";
import {last} from "lodash";

const tourney = createTournament("CVL Winter Open");

function App() {
    const [tabList, setTabList] = useState(
        [
            {
                name: "Roster",
                contents: <MainRoster tourney={tourney} />
            }
        ]
    );
    const [currentTab, setCurrentTab] = useState(tabList[0]);
    const newRound = (event) => {
        let round = tourney.newRound();
        if (!round) {
            alert("Either add players or complete the current matches first.");
            return;
        }
        tabList.push(
            {
                name: "Round " + (round.id + 1),
                id: round.id,
                contents: <Round 
                    tourney={tourney} 
                    roundId={round.id}
                    delFunc={delRound} />
            }
        );
        setTabList([].concat(tabList));
        setCurrentTab(tabList[tabList.length - 1])
    };
    const delRound = (event) => {
        let roundid = Number(event.target.dataset.roundid);
        tourney.removeRound(event.target.dataset.roundid);
        let newTablist = tabList.filter((t) => t.id !== roundid);
        setTabList(newTablist);
        setCurrentTab(last(newTablist));
    };
    return (
        <div className="tournament">
        <nav className="tabbar">
            <ul>
            {tabList.map((tab, i) => 
                <li key={i}>
                <button
                    className="tab"
                    onClick={() => setCurrentTab(tab)}
                    disabled={currentTab === tab} >
                    {tab.name}
                </button>
                </li>
            )}
            <li>
                <button 
                className="tab new_round"
                onClick={newRound} >
                New Round
                </button>
            </li>
            </ul>
        </nav>
        <h1>Chessahoochee: a chess tournament app</h1>
        {currentTab.contents}
        </div>
    );
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
