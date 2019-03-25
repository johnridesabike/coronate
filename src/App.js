import React, { Component } from 'react';
import './App.css';
import {Tournament, Player} from './chess-tourney';
import {Roster, RoundResults, Standings} from './chess-tourney-ui';

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

cvlTourney.addPlayers(players.slice(0,19));

while (cvlTourney.roundList.length < cvlTourney.numOfRounds()) {
  var round = cvlTourney.newRound();
  round.matches.forEach(function(match) {
    var bye = match.isBye();
    if (!bye) {
      if (Math.random() >= 0.5) {
        match.whiteWon();
      } else {
        match.blackWon();
      }
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
        {cvlTourney.roundList.map(round => 
          <div className="round" key={round.roundNum}>
            <RoundResults round={round} tourney={cvlTourney} />
            <Standings players={cvlTourney.roster.active()} roundNum={round.roundNum} tourney={cvlTourney}/>
          </div>
        )}
      </div>
    )
  }
}

export default App;
