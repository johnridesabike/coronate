import  { DUMMYPLAYER } from './player';
const EloRank = require('elo-rank');

/**
 * TODO: make this customizable for each player based on their match history.
 * @constant KFACTOR The k-factor used for calculating ratings
 * @constant ELO     The EloRank object
 */
const KFACTOR = 16;
const ELO = new EloRank(KFACTOR);

/**
 * Represents a match in a tournament.
 *
 * @param {Player} black
 * @param {Player} white
 */
function Match(round, white, black) {
  if (!(this instanceof Match)) {
    return new Match(round, white, black);
  }
  this.round = round;
  this.players = [white, black];
  this.result = [0, 0];
  this.scoreExpected = [0, 0]; // used for the Elo calculator
  this.origRating = [white.rating, black.rating]; // cache the ratings from when the match began
  this.newRating = [white.rating, black.rating]; // the newly calculated ratings after the match ends
  // set bye rounds
  const dummies = this.players.map(p => p.dummy);
  if (dummies[0]) {
    this.result = [0, 1];
  } else if(dummies[1]) {
    this.result = [1, 0];
  }
}

Object.defineProperties(
  Match.prototype,
  {
    whitePlayer: {
      get: function(){ return this.players[0]},
      set: function(player){ this.players[0] = player}
    },
    blackPlayer: {
      get: function(){ return this.players[1]},
      set: function(player){ this.players[1] = player}
    },
    whiteOrigRating: {
      get: function(){ return this.origRating[0]}
    },
    blackOrigRating: {
      get: function(){ return this.origRating[1]}
    },
    isComplete: {
      get: function(){ return this.result.reduce((a, b) => a + b) !== 0}
    },
    isBye: {
      get: function(){ return this.players.includes(DUMMYPLAYER)}
    }
  }
);

Match.prototype.playerInfo = function(player) {
  var index = this.players.indexOf(player)
  if (index === -1) {
    return false;
  }
  return {
    origRating: this.origRating[index],
    newRating: this.newRating[index],
    score: this.result[index]
  }
}

/**
 * Sets black as the winner.
 */
Match.prototype.blackWon = function() {
  this.result = [0, 1];
  this.calcRatings();
}

/**
 * Sets white as the winner.
 */
Match.prototype.whiteWon = function() {
  this.result = [1, 0];
  this.calcRatings();
}

/**
 * Sets result as a draw.
 */
Match.prototype.draw = function() {
  this.result = [0.5, 0.5];
  this.calcRatings();
}

Match.prototype.resetResult = function() {
  this.result = [0, 0];
  this.newRating = this.origRating;
}

Match.prototype.calcRatings = function() {
  this.scoreExpected = [
    ELO.getExpected(this.whiteOrigRating, this.blackOrigRating),
    ELO.getExpected(this.blackOrigRating, this.whiteOrigRating),
  ];
  this.newRating = [
    ELO.updateRating(this.scoreExpected[0], this.result[0], this.whiteOrigRating),
    ELO.updateRating(this.scoreExpected[1], this.result[1], this.blackOrigRating)
  ];
  this.whitePlayer.rating = this.newRating[0];
  this.blackPlayer.rating = this.newRating[1];
}

// This fails for some reason...
// module.exports = {Tournament, Player};

export default Match;