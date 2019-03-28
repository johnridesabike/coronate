import React, { useState, useEffect, Component } from 'react';
import './App.css';
import {Tournament, Player} from './chess-tourney';
import {Roster, Round, Standings} from './chess-tourney-ui';

const cvlTourney = new Tournament(
  'CVL Winter Open',
  15
)

const players = [
  new Player('Matthew', 'A', 800), new Player('Mark', 'B', 850),
  new Player('Luke', 'C', 900), new Player('John', 'D', 950),
  new Player('Simon', 'E', 1000), new Player('Andrew', 'F', 1050),
  new Player('James', 'G', 1100), new Player('Philip', 'H', 1150),
  new Player('Bartholomew', 'I', 1200), new Player('Thomas', 'J', 1250),
  new Player('Catherine', 'K', 1300), new Player('Clare', 'L', 1350),
  new Player('Judas', 'M', 1400), new Player('Matthias', 'N', 1450),
  new Player('Paul', 'O', 1500), new Player('Mary', 'P', 1600),
  new Player('Theresa', 'Q', 1650), new Player('Megan', 'R', 1700),
  new Player('Elizabeth', 'S', 1750)
];

function randomMatches(match) {
  var bye = match.isBye();
  if (!bye) {
    if (Math.random() >= 0.5) {
      match.whiteWon();
    } else {
      match.blackWon();
    }
  }
}

cvlTourney.addPlayers(players.slice(0,16));

// while (cvlTourney.roundList.length < cvlTourney.numOfRounds()) {
//   var round = cvlTourney.newRound();
//   round.matches.forEach(function(match) {
//     var bye = match.isBye();
//     if (!bye) {
//       if (Math.random() >= 0.5) {
//         match.whiteWon();
//       } else {
//         match.blackWon();
//       }
//     }
//   })
// }

function App() {
  const newRound = (event) => {
    var round = cvlTourney.newRound();
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
