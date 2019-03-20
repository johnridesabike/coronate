import React, { Component } from 'react';
import './App.css';
import {Tournament, Player} from './chess-tourney';

function randomRating(min = 800, max = 2500) {
  return Math.floor(Math.random() * (max - min) + min)
}

var cvlTourney = new Tournament(
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
  for (var i in round) {
    var match = round[i]
    if (Math.random() >= 0.5) {
      match.whiteWon()
    } else {
      match.blackWon()
    }
  }
}

class App extends Component {
  render() {
    return (
      <div className="tournament">
        <Roster players={cvlTourney.playerList}/>
        {cvlTourney.roundList.map((round, i) => 
          <div className="round" key={i}>
            <RoundResults round={round} roundNum={i} />
            <Standings players={cvlTourney.playerList} roundNum={i}/>
          </div>
        )}
      </div>
    )
  }
}

class Roster extends Component {
  render() {
    return (
      <section>
        <h2>Roster</h2>
        <table>
          <thead>
            <tr>
              <th>First name</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {this.props.players.map((player, i) =>
              <tr key={i}>
                <td>{player.firstName}</td>
                <td className="table__number">{player.rating}</td>
              </tr>
            )}
          </tbody>
        </table>
        <p>Total rounds: {cvlTourney.numOfRounds()}</p>
      </section>
    )
  }
}

class RoundResults extends Component {
  render() {
    return (
      <section key={this.props.roundNum}>
        <h2>Round {this.props.roundNum + 1} results</h2>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>White</th>
              <th>Black</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {this.props.round.map((match, i) =>
              <tr key={i}>
                <td>{match.result[0] === 1 ? 'Won' : ''}</td>
                <td>{match.players[0].firstName}</td>
                <td>{match.players[1].firstName}</td>
                <td>{match.result[1] === 1 ? 'Won' : ''}</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    )
  }
}

class Standings extends Component {
  render() {
    const players = [].concat(this.props.players)
    const roundNum = this.props.roundNum
    players.sort((a, b) =>
      cvlTourney.playerScore(b, roundNum) - cvlTourney.playerScore(a, roundNum)
    )
    return (
      <section key={roundNum}>
        <h2>Current Standings</h2>
        <table>
          <thead>
            <tr>
              <th>First name</th>
              <th>Score</th>
              <th>Color balance</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, i) => 
              <tr key={i}>
                <td>{player.firstName}</td>
                <td className="table__number">{cvlTourney.playerScore(player, roundNum)}</td>
                <td className="table__number">{cvlTourney.playerColorBalance(player, roundNum)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    )
  }
}

export default App;
