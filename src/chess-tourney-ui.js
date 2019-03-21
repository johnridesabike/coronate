import React, { Component } from 'react';

class Roster extends Component {
  constructor(props) {
    super(props)
    this.tourney = this.props.tourney
  }
  render() {
    return (
      <table>
        <caption>Roster</caption>
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
      <table key={this.roundNum}>
        <caption>Round {this.roundNum + 1} results</caption>
        <thead>
          <tr>
            <th></th>
            <th>White</th>
            <th>Black</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {this.round.matches.map((match, i) =>
            <tr key={i}>
              <td>{match.result[0] === 1 ? 'Won' : ''}</td>
              <td>{match.players[0].firstName}</td>
              <td>{match.players[1].firstName}</td>
              <td>{match.result[1] === 1 ? 'Won' : ''}</td>
            </tr>
          )}
        </tbody>
      </table>
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
      <table key={this.roundNum}>
        <caption>Current Standings</caption>
        <thead>
          <tr>
            <th>First name</th>
            <th>Score</th>
            <th>Color balance</th>
            <th>Opponent count</th>
          </tr>
        </thead>
        <tbody>
          {this.players.map((player, i) => 
            <tr key={i}>
              <td>{player.firstName}</td>
              <td className="table__number">{this.tourney.playerScore(player, this.roundNum)}</td>
              <td className="table__number">{this.tourney.playerColorBalance(player, this.roundNum)}</td>
              <td className="table__number">{this.tourney.playerOppHistory(player, this.roundNum).length}</td>
            </tr>
          )}
        </tbody>
      </table>
    )
  }
}

export {Roster, RoundResults, Standings}