import React, { Component } from 'react';

class Roster extends Component {
  constructor(props) {
    super(props)
    this.tourney = this.props.tourney
  }
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
            {this.tourney.playerList.map((player, i) =>
              <tr key={i}>
                <td>{player.firstName}</td>
                <td className="table__number">{player.rating}</td>
              </tr>
            )}
          </tbody>
        </table>
        <p>Total rounds: {this.tourney.numOfRounds()}</p>
      </section>
    )
  }
}

class RoundResults extends Component {
  constructor(props) {
    super(props)
    this.roundNum = this.props.roundNum
    this.round = this.props.round
  }
  render() {
    return (
      <section key={this.roundNum}>
        <h2>Round {this.roundNum + 1} results</h2>
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
            {this.round.map((match, i) =>
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
  constructor(props) {
    super(props)
    this.roundNum = this.props.roundNum
    this.tourney = this.props.tourney
    this.players = [].concat(this.props.players)
    this.players.sort((a, b) =>
      this.tourney.playerScore(b, this.roundNum) - this.tourney.playerScore(a, this.roundNum)
    )
  }
  render() {
    return (
      <section key={this.roundNum}>
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
            {this.players.map((player, i) => 
              <tr key={i}>
                <td>{player.firstName}</td>
                <td className="table__number">{this.tourney.playerScore(player, this.roundNum)}</td>
                <td className="table__number">{this.tourney.playerColorBalance(player, this.roundNum)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    )
  }
}

export {Roster, RoundResults, Standings}