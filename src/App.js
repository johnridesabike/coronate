import React, { Component } from 'react';
import './App.css';
import {Tournament, Player} from './chess-tourney';
import {Roster, RoundResults, Standings} from './chess-tourney-ui';

function randomRating(min = 800, max = 2500) {
  return Math.floor(Math.random() * (max - min) + min)
}

const cvlTourney = new Tournament(
  'CVL Winter Open',
  15, 
  [
    new Player('Matthew', 'A', randomRating()), new Player('Mark', 'B', randomRating()),
    new Player('Luke', 'C', randomRating()), new Player('John', 'D', randomRating()),
    new Player('Simon', 'E', randomRating()), new Player('Andrew', 'F', randomRating()),
    new Player('James', 'G', randomRating()), new Player('Philip', 'H', randomRating()),
    new Player('Bartholomew', 'I', randomRating()), new Player('Thomas', 'J', randomRating()),
    new Player('Catherine', 'K', randomRating()), new Player('Clare', 'L', randomRating()),
    new Player('Judas', 'M', randomRating()), new Player('Matthias', 'N', randomRating()),
    new Player('Paul', 'O', randomRating()), new Player('Mary', 'P', randomRating())
  ]
)

while (cvlTourney.roundList.length < cvlTourney.numOfRounds()) {
  var round = cvlTourney.newRound()
  round.matches.forEach(function(match) {
    if (Math.random() >= 0.5) {
      match.whiteWon()
    } else {
      match.blackWon()
    }
  })
}

class App extends Component {
  render() {
    return (
      <div className="tournament">
        <h1>Chessahoochee: a chess tournament app</h1>
        <Roster tourney={cvlTourney}/>
        <p className="center">Total rounds: {cvlTourney.numOfRounds()}</p>
        {cvlTourney.roundList.map((round, i) => 
          <div className="round" key={i}>
            <RoundResults round={round} roundNum={i} tourney={cvlTourney} />
            <Standings players={cvlTourney.playerList} roundNum={i} tourney={cvlTourney}/>
          </div>
        )}
      </div>
    )
  }
}

export default App;
