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
  var roundId = Math.ceil(Math.log2(this.roster.active.length));
  if (roundId === -Infinity) {
    roundId = 0;
  }
  return roundId;
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

Tournament.prototype.playerMatchHistory = function(player, roundId = null) {
  if (roundId === null) {
    roundId = this.roundList.length;
  }
  let matches = []
  times(roundId + 1, i => {
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
Tournament.prototype.playerScoreList = function(player, roundId = null) {
  var scores = this
    .playerMatchHistory(player, roundId)
    .map(match => 
      match.result[match.players.indexOf(player)]);
  return scores;
}

/**
 * Get the total score of a player after a given round.
 * @param {Player} player 
 * @param {number} roundId 
 */
Tournament.prototype.playerScore = function(player, roundId = null) {
  var score = 0;
  var scoreList = this.playerScoreList(player, roundId);
  if (scoreList.length > 0) {
    score = scoreList.reduce((a, b) => a + b);
  }
  return score;
}

/**
 * Get the cumulative score of a player
 * @param {Player} player 
 * @param {number} roundId 
 */
Tournament.prototype.playerScoreCum = function(player, roundId = null) {
  var runningScore = 0;
  var cumScores = []
  var scores = this.playerScoreList(player, roundId);
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
Tournament.prototype.playerColorBalance = function(player, roundId = null) {
  var color = 0;
  this
    .playerMatchHistory(player, roundId)
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
 * @param {number} roundId 
 */
Tournament.prototype.modifiedMedian = function(player, roundId = null, solkoff = false) {
  // get all of the opponent's scores
  var scores = this.playerOppHistory(player, roundId)
    .map(opponent => this.playerScore(opponent, roundId));
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
 * @param {number} roundId 
 */
Tournament.prototype.solkoff = function(player, roundId = null) {
  return this.modifiedMedian(player, roundId, true);
}

/**
 * Generate a list of a player's opponents.
 * @param   {Player} player
 * @returns {Array} A list of past opponents
 */
Tournament.prototype.playerOppHistory = function(player, roundId = null) {
  var opponents = [];
  this
    .playerMatchHistory(player, roundId)
    .forEach(match => {
      opponents = opponents.concat(
        match.players
          .filter(player2 => player2 !== player)
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
 * @param {number} roundId 
 * @returns {Array} The sorted list of players
 */
Tournament.prototype.calcStandings = function(roundId = null) {
  const standingsFlat = this.roster.all.map(player => {
    return {
      player: player,
      score: this.playerScore(player, roundId),
      modifiedMedian: this.modifiedMedian(player, roundId),
      solkoff: this.solkoff(player, roundId),
      scoreCum: this.playerScoreCum(player, roundId),
      oppScoreCum: this.playerOppScoreCum(player, roundId)
    }
  });
  standingsFlat.sort(
    firstBy(p => p.score, -1)
    .thenBy(p => p.modifiedMedian, -1)
    .thenBy(p => p.solkoff, -1)
    .thenBy(p => p.scoreCum, -1)
    .thenBy(p => p.oppScoreCum, -1)
  );
  const standingsTree = [];
  let runningRank = 0;
  standingsFlat.forEach((player, i, sf) => {
    if (i !== 0) { // we can't compare the first player with someone before them
      let prevPlayer = sf[i - 1];
      if (!(player.score === prevPlayer.score &&
          player.modifiedMedian === prevPlayer.modifiedMedian &&
          player.solkoff === prevPlayer.solkoff &&
          player.scoreCum === prevPlayer.scoreCum &&
          player.oppScoreCum === prevPlayer.oppScoreCum)
      ) {
        runningRank += 1;
      }
    }
    if (!standingsTree[runningRank]) {
      standingsTree[runningRank] = [];
    }
    standingsTree[runningRank].push(player);
  });
  return standingsTree;
}
