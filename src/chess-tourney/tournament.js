import Roster from './roster';
import Round from './round';
const { firstBy }     = require('thenby'),
      { last, times } = require('lodash');

/**
 * Tournament class
 * @param {string} name
 * @param {int}    timeControl
 * @param {array}  roster
 * @param {int}    byeValue
 */
function Tournament(name = '', timeControl = 15, roster = [], byeValue = 1) {
  if (!(this instanceof Tournament)) {
    return new Tournament(name, timeControl, roster, byeValue)
  }
  this.name = name;
  this.timeControl = timeControl;
  this.roster = Roster(roster);
  this.roundList = [];
  this.byeValue = byeValue;
}

Object.defineProperties(
  Tournament.prototype,
  {
    isNewRoundReady: {
      get: function() {
        var isReady = false;
        if (this.roundList.length > 0) {
          isReady = last(this.roundList).isComplete;
        } else {
          isReady = (this.roster.all.length > 0);
        }
        return isReady;
      }
    }
  }
);

/**
 * Add a player to the roster.
 * @param {Player} player the player to add
 */
Tournament.prototype.addPlayer = function(player) {
  this.roster.all.push(player);
}

/**
 * Add a list of players to the roster.
 * @param {Array} players the list of players to add
 */
Tournament.prototype.addPlayers = function(players) {
  this.roster.all = this.roster.all.concat(players);
}

/**
 * Remove a player from the active roster. This player won't be placed in
 * future rounds.
 * @param {Player} player 
 */
Tournament.prototype.deactivatePlayer = function(player) {
  this.roster.inactive.push(player);
}
  
/**
 * Add a player to the active roster. This player will be placed in future
 * rounds.
 * @param {Player} player 
 */
Tournament.prototype.activatePlayer = function(player) {
  this.roster.inactive.splice(this.roster.inactive.indexOf(player), 1);
}

Tournament.prototype.removePlayer = function(player) {
  if (this.playerMatchHistory(player).length > 0) {
    return false; // TODO: add a helpful error message
  }
  delete this.roster.all[this.roster.all.indexOf(player)];
  return this;
}

/**
 * Calculate number of rounds.
 * @returns {int} the number of rounds
 */
Tournament.prototype.numOfRounds = function() {
  var roundNum = Math.ceil(Math.log2(this.roster.active.length));
  if (roundNum === -Infinity) {
    roundNum = 0;
  }
  return roundNum;
}

/**
 * Calculate standings
 */
Tournament.prototype.calcStandings = function() {
  return true; // todo
}

Tournament.prototype.playerMatchHistory = function(player, roundNum = null) {
  if (roundNum === null) {
    roundNum = this.roundList.length;
  }
  var matches = []
  times(roundNum + 1, i => {
    if (this.roundList[i] !== undefined) {
      this.roundList[i].matches.forEach(match => {
        if (match.players.indexOf(player) !== -1) {
          matches.push(match);
        }
      })
    }
  });
  return matches;
}

/**
 * Get a list of all of a player's scores from each match.
 * @param {Player} player
 * @returns {array} the list of scores
 */
Tournament.prototype.playerScoreList = function(player, roundNum = null) {
  var scores = this
    .playerMatchHistory(player, roundNum)
    .map(match => 
      match.result[match.players.indexOf(player)]);
  return scores;
}

/**
 * Get the total score of a player after a given round.
 * @param {Player} player 
 * @param {number} roundNum 
 */
Tournament.prototype.playerScore = function(player, roundNum = null) {
  var score = 0;
  var scores = this.playerScoreList(player, roundNum);
  if (scores.length > 0) {
    score = scores.reduce((a, b) => a + b);
  }
  return score;
}

/**
 * Get the cumulative score of a player
 * @param {Player} player 
 * @param {number} roundNum 
 */
Tournament.prototype.playerScoreCum = function(player, roundNum = null) {
  var runningScore = 0;
  var cumScores = []
  var scores = this.playerScoreList(player, roundNum);
  scores.forEach(score => {
    runningScore += score;
    cumScores.push(runningScore);
  });
  var totalScore = 0;
  if (cumScores.length !== 0) {
    totalScore = cumScores.reduce((a, b) => a + b);
  }
  return totalScore;
}

/**
 * Calculate a player's color balance
 * @param {Player} player
 * @param {Int}    round The ID of the highest round to consider
 * @returns {Int} A negative number means they played as black more. A positive number means they played as white more.
 */
Tournament.prototype.playerColorBalance = function(player, roundNum = null) {
  var color = 0;
  this
    .playerMatchHistory(player, roundNum)
    .forEach(match => {
      if (match.players[0] === player) {
        color += 1;
      } else if (match.players[1] === player) {
        color += -1;
      }
    }
  );
  return color;
}

/**
 * Sort the standings by score and USCF tie-break rules from § 34. USCF
 * recommends using these methods in-order: modified median, solkoff, 
 * cumulative, and cumulative of opposition.
 * @param {number} roundNum 
 * @returns {Array} The sorted list of players
 */
Tournament.prototype.playerStandings = function(roundNum = null) {
  var playersClone = [].concat(this.roster.all);
  playersClone.sort(
    firstBy(p => this.playerScore(p, roundNum), -1)
    .thenBy(p => this.modifiedMedian(p, roundNum), -1) /* USCF § 34E1 */
    .thenBy(p => this.solkoff(p, roundNum), -1) /* USCF § 34E2 */
    .thenBy(p => this.playerScoreCum(p, roundNum), -1) /* USCF § 34E3 */
    .thenBy(p => this.playerOppScoreCum(p, roundNum), -1) /* USCF § 34E9 */
  );
  return playersClone;
}

/**
 * Gets the modified median factor defined in USCF § 34E1
 * @param {Player} player 
 * @param {number} roundNum 
 */
Tournament.prototype.modifiedMedian = function(player, roundNum = null, solkoff = false) {
  // get all of the opponent's scores
  var scores = this.playerOppHistory(player, roundNum)
    .map(opponent => this.playerScore(opponent, roundNum));
  //sort them, then remove the first and last items
  scores.sort();
  if (!solkoff) {
    scores.pop();
    scores.shift();
  }
  var finalScore = 0;
  if (scores.length > 0) {
    finalScore = scores.reduce((a,b) => a + b);
  }
  return finalScore;
}
  
/**
 * A shortcut for passing the `solkoff` variable to `this.modifiedMedian`.
 * @param {Player} player 
 * @param {number} roundNum 
 */
Tournament.prototype.solkoff = function(player, roundNum = null) {
  return this.modifiedMedian(player, roundNum, true);
}

/**
 * Generate a list of a player's opponents.
 * @param   {Player} player
 * @returns {Array} A list of past opponents
 */
Tournament.prototype.playerOppHistory = function(player, roundNum = null) {
  var opponents = [];
  this
    .playerMatchHistory(player, roundNum)
    .forEach(match => {
      opponents = opponents.concat(
        match.players
          .filter(player2 => player2 !== player)
          .filter(player2 => !opponents.includes(player2))
      );
    }
  );
  return opponents
}

Tournament.prototype.playerOppScoreCum = function(player, round = null) {
  const opponents = this.playerOppHistory(player, round);
  var oppScores = opponents.map(p => this.playerScoreCum(p, round));
  var score = 0;
  if (oppScores.length !== 0){
    score = oppScores.reduce((a, b) => a + b);
  }
  return score;
}

/**
 * Generates a new round.
 * @returns {Array} the new round
 */
Tournament.prototype.newRound = function() {
  if (!this.isNewRoundReady) {
    return false;
  }
  var newRound = Round(
    this,
    this.roundList.length,
    last(this.roundList),
    this.roster.active
  );
  newRound.pairPlayers();
  this.roundList.push(newRound);
  return newRound;
}

export default Tournament;