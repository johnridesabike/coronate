import Roster from './roster';
import Round from './round';
import { firstBy } from 'thenby';
import { last, times } from 'lodash';

/**
 * Tournament class
 * @param {string} name
 * @param {int}    timeControl
 * @param {array}  roster
 * @param {int}    byeValue
 */
export default function Tournament(name = '', timeControl = 15, roster = [], byeValue = 1) {
  if (!(this instanceof Tournament)) {
    return new Tournament(name, timeControl, roster, byeValue)
  }
  this.name = name;
  this.timeControl = timeControl;
  this.roster = Roster(roster, this);
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
  this.roundList.push(newRound);
  return newRound;
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
  var scoreList = this.playerScoreList(player, roundNum);
  if (scoreList.length > 0) {
    score = scoreList.reduce((a, b) => a + b);
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
    .filter(match => !match.isBye)
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
 * Sort the standings by score and USCF tie-break rules from § 34. USCF
 * recommends using these methods in-order: modified median, solkoff, 
 * cumulative, and cumulative of opposition.
 * @param {number} roundNum 
 * @returns {Array} The sorted list of players
 */
Tournament.prototype.calcStandings = function(roundNum = null) {
  const standings = this.roster.all.map(player => {
    return {
      player: player,
      score: this.playerScore(player, roundNum),
      modifiedMedian: this.modifiedMedian(player, roundNum),
      solkoff: this.solkoff(player, roundNum),
      scoreCum: this.playerScoreCum(player, roundNum),
      oppScoreCum: this.playerOppScoreCum(player, roundNum)
    }
  });
  standings.sort(
    firstBy(p => p.score, -1)
    .thenBy(p => p.modifiedMedian, -1)
    .thenBy(p => p.solkoff, -1)
    .thenBy(p => p.scoreCum, -1)
    .thenBy(p => p.oppScoreCum, -1)
  );
  return standings;
}
