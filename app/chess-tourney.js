/* ----------------------------------------------------------------------------
*                               Chess Tourney
*
* This file handles all of the tournament logic.
* At some point, this could turn into a standalone node module.

Todo:
- Players
    - Ratings
- Pairings
    - Swiss
    - Tie-breaking
- Standings
* --------------------------------------------------------------------------- */
'use strict'

/**
 * Define constants.
 */
const SWISS = 0
const ROUND_ROBIN = 1

/**
 * Represents an indivudal player.
 *
 * @param {string} firstName
 * @param {string} lastName
 * @param {int}    rating
 */
class Player {
  constructor (firstName, lastName, rating) {
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
  constructor (name, timeControl, type = SWISS, playerList = []) {
    this.name = name
    this.timeControl = timeControl
    this.type = type
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
    let playerNum = this.playerList.length
    switch (this.type) {
      case SWISS:
        return Math.ceil(Math.log2(playerNum))
      case ROUND_ROBIN:
        return Math.ceil(playerNum / 2) * 2 - 1
    }
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
    var score
    for (var round in this.roundList) {
      for (var match in this.roundList[round]) {
        var index = this.roundList[round][match].players.indexOf(player)
        if (index !== -1) {
          score += this.roundList[round][match].results[index]
        }
      }
    }
    return score
  }
}

/**
 * Represents a match in a tournament.
 *
 * @param {Player} black
 * @param {Player} white
 */
class Match {
  constructor (black, white) {
    this.players = [black, white]
    this.ratingsStart = [black.rating, white.rating]
    this.ratingsChange = []
    this.result = [0, 0]
  }

  /**
   * Sets black as the winner.
   */
  blackWon () {
    this.result = [1, 0]
    // calculate ratings
  }

  /**
   * Sets white as the winner.
   */
  whiteWon () {
    this.result = [0, 1]
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

var players = []
var john = new Player('John', 'Jackson', 1200)

players.push(john)

module.exports.getPlayer = function (input) {
  return players[input]
}
