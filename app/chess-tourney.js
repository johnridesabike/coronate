/* ----------------------------------------------------------------------------
*                               Chess Tourney
*
* This file handles all of the tournament logic.
* At some point, this could turn into a standalone node module.
* --------------------------------------------------------------------------- */
'use strict'

/**
 * Represents an indivudal player.
 *
 * @param {string} firstName
 * @param {string} lastName
 * @param {int}    rating
 */
class Player {
  constructor (firstName, lastName, rating = 1200) {
    this.firstName = firstName
    this.lastName = lastName
    this.rating = rating
  }
}

/**
 * Represents a tournament
 *
 * @param {string} name
 * @param {int} timeControl
 * @param {array}  playerList
 * @param {int}    type
 */
class Tournament {
  constructor (name, timeControl, playerList = []) {
    this.name = name
    this.timeControl = timeControl
    this.playerList = playerList
    this.roundList = []
  }

  /**
   * Add a player to the roster
   *
   * @param {Player} player
   */
  addPlayer (player) {
    this.playerList.push(player)
  }

  /**
   * Calculate number of rounds
   */
  numOfRounds () {
    return Math.ceil(Math.log2(this.playerList.length))
  }

  /**
   * Calculate standings
   */
  calcStandings () {
    return true // todo
  }

  /**
   * Calculate a player's score.
   *
   * @param {Player} player
   */
  playerScore (player) {
    var score = 0
    for (var r in this.roundList) {
      for (var m in this.roundList[r]) {
        var match = this.roundList[r][m]
        var index = match.players.indexOf(player)
        if (index !== -1) {
          score += match.result[index]
        }
      }
    }
    return score
  }

  /**
   * Calculate a player's color balance
   *
   * @param {Player} player
   *
   * @return {Int} A negative number means they played as black more. A positive number means they played as white more.
   */
  playerColorBalance (player) {
    var color = 0
    for (var r in this.roundList) {
      for (var m in this.roundList[r]) {
        var match = this.roundList[r][m]
        if (match.players[0] === player) {
          color += 1
        } else if (match.players[1] === player) {
          color += -1
        }
      }
    }
    return color
  }

  /**
   * Generate a list of a player's opponents.
   *
   * @param {Player} player
   *
   * @return {Array} A list of past opponents
   */
  playerOppHistory (player) {
    var opponents = []
    for (var r in this.roundList) {
      for (var m in this.roundList[r]) {
        var matchPlayers = this.roundList[r][m].players
        if (matchPlayers.includes(player)) {
          opponents = opponents.concat(
            matchPlayers.filter(
              player2 => player2 !== player && !opponents.includes(player2)
            )
          )
        }
      }
    }
    return opponents
  }

  /**
   * Generates a new round.
   */
  newRound () {
    var players = []
    // Generate a list of players and their scores
    for (var p in this.playerList) {
      var player = this.playerList[p]
      var score = 0
      for (var r in this.roundList) {
        for (var m in this.roundList[r]) {
          var match = this.roundList[r][m]
          var playerIndex = match.players.indexOf(player)
          if (playerIndex !== -1) {
            score += match.result[playerIndex]
          }
        }
      }
      players.push({ player: player, score: score })
    }
    // Sort the players by their scores.
    players.sort((a, b) => a.score - b.score)
    // Match players
    var newRound = []
    for (var i = 0; i < players.length / 2; i++) {
      var player1 = players[i * 2].player
      var player2 = players[i * 2 + 1].player
      // check if players played eachother
      // if (this.playerOppHistory(player1).includes(player2)) {
      //   // TODO
      // }
      var newMatch = new Match(player1, player2)
      // Equalize black and white
      if (this.playerColorBalance(player1) > this.playerColorBalance(player2)) {
        newMatch.players.reverse()
      }
      newRound.push(newMatch)
    }
    // return the new round.
    this.roundList.push(newRound)
    return newRound
  }
}

/**
 * Represents a match in a tournament.
 *
 * @param {Player} black
 * @param {Player} white
 */
class Match {
  constructor (white, black) {
    this.players = [white, black]
    this.ratingsStart = [white.rating, black.rating]
    this.ratingsChange = []
    this.result = [0, 0]
  }

  /**
   * Sets black as the winner.
   */
  blackWon () {
    this.result = [0, 1]
    // calculate ratings
  }

  /**
   * Sets white as the winner.
   */
  whiteWon () {
    this.result = [1, 0]
    // calculate ratings
  }

  /**
   * Sets result as a draw.
   */
  draw () {
    this.result = [0.5, 0.5]
    // calculate ratings
  }
}

module.exports = {
  Tournament: Tournament,
  Player: Player
}
