import React, { useState, useEffect, Component } from 'react';
import './App.css';
import {Tournament, Player} from './chess-tourney';
import {Roster, Round} from './chess-tourney-ui';

const cvlTourney = new Tournament(
  'CVL Winter Open',
  15
)

function App() {
  const newRound = (event) => {
    var round = cvlTourney.newRound();
    if (!round) {
      alert('Either add players or complete the current matches first.');
      return;
    }
    tabList.push(
      {
        name: 'Round ' + (round.roundNum + 1),
        contents: <Round tourney={cvlTourney} roundNum={round.roundNum} />
      }
    );
    setTabList([].concat(tabList));
    setCurrentTab(tabList[tabList.length - 1])
  }
  const [tabList, setTabList] = useState(
    [
      {
        name: 'Roster',
        contents: <Roster tourney={cvlTourney} />
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
      {/* {cvlTourney.roundList.map(round => 
        <div className="round" key={round.roundNum}>
          <Round round={round} />
        </div>
      )} */}
    </div>
  );
}

export default App;
