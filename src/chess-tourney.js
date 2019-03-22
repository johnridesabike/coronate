/* ----------------------------------------------------------------------------
*                               Chess Tourney
*
* This file handles all of the tournament logic.
* At some point, this could turn into a standalone node module.
* --------------------------------------------------------------------------- */
var {chain, has, pull, times, zip} = require('lodash')

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
  constructor (name = '', timeControl = 15, playerList = []) {
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
  addPlayer(player) {
    this.playerList.push(player)
  }

  /**
   * Add a list of players to the roster
   * @param {Array} playerList 
   */
  addPlayers(playerList) {
    this.playerList = this.playerList.concat(playerList)
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
    times(round + 1, function(i) {
      if(this.roundList[i] !== undefined) {
        this.roundList[i].matches.forEach(function(match) {
          var index = match.players.indexOf(player)
          if (index !== -1) {
            score += match.result[index]
          }
        })
      }
    }.bind(this))
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
    times(round + 1, function(i) {
      if(this.roundList[i] !== undefined) {
        this.roundList[i].matches.forEach(function(match) {
          if (match.players[0] === player) {
            color += 1
          } else if (match.players[1] === player) {
            color += -1
          }
        })
      }
    }.bind(this))
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
      round = this.roundList.length - 1
    }
    times(round + 1, function(i) {
      this.roundList[i].matches.forEach(function(match) {
        if (match.players.includes(player)) {
          opponents = opponents.concat(
            match.players.filter(
              player2 => player2 !== player && !opponents.includes(player2)
            )
          )
        }
      })
    }.bind(this))
    return opponents
  }

  /**
   * Generates a new round.
   * @return {Array} the new round
   */
  newRound() {
    var newRound = new Round(
      this,
      this.roundList.length,
      this.roundList[this.roundList.length - 1],
      this.playerList
    )
    newRound.pairPlayers()
    this.roundList.push(newRound)
    return newRound
  }
  /* newRoundOld () {
    var players = []
    // Generate a list of players and their scores
    _.forEach(this.playerList, function(player) {
      var score = 0
      _.forEach(this.roundList, function(round) {
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
  } */
}

/**
 * Represents a round in a tournament.
 */
class Round {
  playerTree = {}
  matches = []

  constructor(tourney, roundNum, prevRound, players) {
    this.roundNum = roundNum
    this.tourney = tourney
    this.playersFlat = players
    this.prevRound = prevRound
  }

  /**
   * Pair the players
   * TODO:
   * - Split players into separate lists based on scores (§ 27A2)
   * - Split players (again) into separate lists based on their ranks, upper half vs lower half (§27A3)
   * - For each player in the upper half, iterate through the lower half to find an opponent
   * - - De-queue opponents who faced that player already (§27A1)
   * - - Pre-assign the player to the opposite color as their last round. (§27A4 & §27A5)
   * - - Prioritize opponents who played that color for *their* last round. (§27A4 & §27A5)
   * - Account for odd numbers and other exceptions where players must play each other (low priority)
   *
   */
  pairPlayers() {
    // Group players by score
    this.playersFlat.forEach(function(player) {
      var score = this.tourney.playerScore(player)
      if( !has(this.playerTree, score) ) {
        this.playerTree[score] = []
      }
      this.playerTree[score].push(player)
    }.bind(this))
    // TODO: Check for score groups with only one member
    // Split each score group into an upper half and a lower half
    var playerTreeTest = {}
    // _.forEach(this.playerTree, function(value, key) {
    Object.keys(this.playerTree).forEach(function(key) {
      var value = this.playerTree[key]
      playerTreeTest[key] = chain(value).sortBy('rating').reverse().chunk(value.length/2).value()
    }.bind(this))
    // Pair players and equalize black and white
    Object.keys(playerTreeTest).forEach(function(key) {
      var scoreGroup = playerTreeTest[key]
      // If there was no previous round, just zip the arrays and call it a day.
      if (this.prevRound === undefined) {
        var matches = zip(scoreGroup[0], scoreGroup[1])
        matches.forEach(match => this.matches.push(new Match(...match)))
      } else {
        var scoreGClone = [].concat(scoreGroup)
        scoreGroup[0].forEach(function(player1) {
          var lastColor = this.prevRound.playerColor(player1)
          var opposites = scoreGClone[1].filter(p => 
            lastColor !== this.prevRound.playerColor(p)
            && this.tourney.playerOppHistory(p, this.roundNum - 1).indexOf(player1) === -1)
          // esnure that no two players don't play each other twice
          var player2 = opposites[0]
          if (player1 !== undefined && player2 !== undefined) {
            scoreGClone[0] = pull(scoreGClone[0], player1)
            scoreGClone[1] = pull(scoreGClone[1], player2)
            var newMatch = new Match(player1, player2)
            if (this.tourney.playerColorBalance(player1) > this.tourney.playerColorBalance(player2)) {
              newMatch.players.reverse()
            }
            this.matches.push(newMatch)
          }
        }.bind(this))
        // Account for any unmatched players
        zip(scoreGClone[0], scoreGClone[1]).forEach(function(match) {
          var newMatch = new Match(...match)
          if (this.tourney.playerColorBalance(match[0]) > this.tourney.playerColorBalance(match[1])) {
            newMatch.players.reverse()
          }
          this.matches.push(newMatch)
        }.bind(this))
      }
      //matchesTest = _.concat(matchesTest, _.zip(halves[0], halves[1]))
    }.bind(this))

    // _.forEach(matchesTest, function(match) {
    //   var [player1, player2] = match
    //   this.matches.push(new Match(player1, player2))
    // }.bind(this))

    // _.forEach(this.playerTree, function(group, score) {
    //   for (var i = 0; i < group.length / 2; i++) {
    //     var player1 = group[i * 2]
    //     var player2 = group[i * 2 + 1]
    //     var newMatch = new Match(player1, player2)
    //     // Equalize black and white
    //     if (this.tourney.playerColorBalance(player1) > this.tourney.playerColorBalance(player2)) {
    //       newMatch.players.reverse()
    //     }
    //     this.matches.push(newMatch)
    //   }
    // }.bind(this))
    return this.matches
  }

  /**
   * Sees what color a player was for this round.
   * @param {Player} player 
   * @return {number} 0 for white and 1 for black
   */
  playerColor(player) {
    var color = -1
    this.matches.forEach(function(match) {
      if (match.players.includes(player)) {
        color = match.players.indexOf(player);
      }
    })
    return color
  }

  /**
   * Add a player to the roster
   *
   * @param {Player} player
   */
  addPlayer(player) {
    this.players.push(player)
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
