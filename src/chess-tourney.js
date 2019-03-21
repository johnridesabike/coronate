/* ----------------------------------------------------------------------------
*                               Chess Tourney
*
* This file handles all of the tournament logic.
* At some point, this could turn into a standalone node module.
* --------------------------------------------------------------------------- */
var _ = require('lodash');

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
  playerScore (player, round = null) {
    var score = 0
    if ( round === null) {
      round = this.roundList.length
    }
    var roundList = this.roundList // Has to reference it because `this` is reassigned inside the next function
    _.times(round + 1, function(i) {
      _.forEach(roundList[i], function(match) {
        var index = match.players.indexOf(player)
        if (index !== -1) {
          score += match.result[index]
        }
      })
    })
    return score
  }

  /**
   * Calculate a player's color balance
   *
   * @param {Player} player
   *
   * @return {Int} A negative number means they played as black more. A positive number means they played as white more.
   */
  playerColorBalance (player, round = null) {
    var color = 0
    if ( round === null) {
      round = this.roundList.length
    }
    var roundList = this.roundList // Has to reference it because `this` is reassigned inside the next function
    _.times(round + 1, function(i) {
      _.forEach(roundList[i], function(match) {
        if (match.players[0] === player) {
          color += 1
        } else if (match.players[1] === player) {
          color += -1
        }
      })
    })
    return color
  }

  /**
   * Generate a list of a player's opponents.
   *
   * @param {Player} player
   *
   * @return {Array} A list of past opponents
   */
  playerOppHistory (player, round = null) {
    var opponents = []
    if ( round === null) {
      round = this.roundList.length
    }
    var roundList = this.roundList // Has to reference it because `this` is reassigned inside the next function
    _.times(round + 1, function(i) {
      _.forEach(roundList[i], function(match) {
        if (match.players.includes(player)) {
          opponents = opponents.concat(
            match.players.filter(
              player2 => player2 !== player && !opponents.includes(player2)
            )
          )
        }
      })
    })
    return opponents
  }

  /**
   * Generates a new round.
   * TODO:
   * - Split players into separate lists based on scores (§ 27A2)
   * - Split players (again) into separate lists based on their ranks, upper half vs lower half (§27A3)
   * - For each player in the upper half, iterate through the lower half to find an opponent
   * - - De-queue opponents who faced that player already (§27A1)
   * - - Pre-assign the player to the opposite color as their last round. (§27A4 & §27A5)
   * - - Prioritize opponents who played that color for *their* last round. (§27A4 & §27A5)
   * - Account for odd numbers and other exceptions where players must play each other (low priority)
   *
   * @return {Array} the new round
   */
  newRound () {
    var players = []
    var roundList = this.roundList
    // Generate a list of players and their scores
    _.forEach(this.playerList, function(player) {
      var score = 0
      _.forEach(roundList, function(round) {
        _.forEach(round, function(match) {
          var playerIndex = match.players.indexOf(player)
          if (playerIndex !== -1) {
            score += match.result[playerIndex]
          }
        })
      })
      players.push({ player: player, score: score })

    })
    // Sort the players by their scores.
    players.sort((a, b) => a.score - b.score)
    // Match players
    var newRound = []
    for (var i = 0; i < players.length / 2; i++) {
      var player1 = players[i * 2].player
      var player2 = players[i * 2 + 1].player
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

export {Tournament,Player}
