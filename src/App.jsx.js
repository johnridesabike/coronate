import React, { useState } from "react";
import "./App.css";
import {createTournament} from "./chess-tourney";
import {MainRoster, Round} from "./chess-tourney.jsx.js";

const cvlTourney = createTournament("CVL Winter Open");

function App() {
  const newRound = (event) => {
    var round = cvlTourney.newRound();
    if (!round) {
      alert("Either add players or complete the current matches first.");
      return;
    }
    tabList.push(
      {
        name: "Round " + (round.id + 1),
        contents: <Round tourney={cvlTourney} roundId={round.id} />
      }
    );
    setTabList([].concat(tabList));
    setCurrentTab(tabList[tabList.length - 1])
  }
  const [tabList, setTabList] = useState(
    [
      {
        name: "Roster",
        contents: <MainRoster tourney={cvlTourney} />
      }
    ]
  );
  const [currentTab, setCurrentTab] = useState(tabList[0]);
  return (
    <div className="tournament">
      <nav className="tabbar">
        <ul>
          {tabList.map((tab, i) => 
            <li key={i}>
              <button
                className="tab"
                onClick={() => setCurrentTab(tab)}
                disabled={currentTab === tab}
                >
                {tab.name}
              </button>
            </li>
          )}
          <li>
            <button 
              className="tab new_round"
              onClick={newRound}
              >
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
