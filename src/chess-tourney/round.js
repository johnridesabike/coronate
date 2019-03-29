import { DUMMYPLAYER } from './player';
import Match from './match';
const { chain, flatten, zip } = require('lodash');

/**
 * Represents a round in a tournament.
 */
function Round(tourney, roundNum, prevRound, players) {
  if (!(this instanceof Round)) {
    return new Round(tourney, roundNum, prevRound, players)
  }
  this.roundNum = roundNum;
  this.tourney = tourney;
  this.roster = players;
  this.prevRound = prevRound;
  this.playerTree = {};
  this.matches = [];
  this.hasDummy = false;
}

Object.defineProperties(
  Round.prototype,
  {
    isComplete: {
      get: function(){
        return !this.matches.map(m => m.isComplete).includes(false);
      }
    }
  }
);

/**
 * Pair the players
 */
Round.prototype.pairPlayers = function() {
  /**
   * Part 1: Split players into separate groups based on their scores
   * (USCF § 27A2)
   * Tree structure:
   * {
   *  score: [list of players],
   *  ...
   * }
   */
  this.roster.forEach(player => {
    var score = this.tourney.playerScore(player);
    if(!(score in this.playerTree)) {
      this.playerTree[score] = [];
    }
    this.playerTree[score].push(player);
  });
  /**
   * Part 2: Split each score group into an upper half and a lower half, 
   * based on rating (USCF § 27A3)
   * Tree structure:
   * {
   *  score: [
   *    [upper half list of players],
   *    [lower half list of players]
   *  ],
   *  ...
   * }
   */
  Object.keys(this.playerTree).reverse().forEach((score, i, scoreList) => {
    var players = this.playerTree[score];
    /**
     * If there's an odd number of players in this score group,
     */
    if (players.length % 2 !== 0) {
      /**
       * ...and if there's an odd number of players in the total round, then
       * add a dummy player.
       */
      if (this.roster.length % 2 !== 0 && !this.hasDummy) {
        players.push(DUMMYPLAYER);
        this.hasDummy = true;
      /**
       * But if there's an even number of players in the total round, then
       * just move a player to the next score group.
       */
      } else {
        var oddPlayer = players[players.length - 1];
        players.splice(players.length - 1, 1);
        var newGroup = scoreList[i + 1]; // the group to move the player to
        if(!(newGroup in this.playerTree)) {
          this.playerTree[newGroup] = [];
        }
        this.playerTree[newGroup].push(oddPlayer);
      }
    }
    /**
     * If there are no players in this group (e.g. a lone player got pushed
     * to another group) then delete the key.
     */
    if (players.length === 0) {
      delete this.playerTree[score];
    } else {
      this.playerTree[score] = chain(players)
      .sortBy('rating')
      .reverse()
      .chunk(players.length / 2)
      .value();
    }
  });
  Object.keys(this.playerTree).forEach(score => {
    // name the upperHalf and lowerHalf to make the code easier to read
    var upperHalf = this.playerTree[score][0];
    var lowerHalf = this.playerTree[score][1];
    /**
     * If there was no previous round, zip the players and call it a day.
     */
    if (this.prevRound === undefined) {
      zip(upperHalf, lowerHalf)
        .forEach(match => 
          this.matches.push(new Match(this, ...match))
        );
    } else {
      /**
       * If there was a previous round, then things get complicated....
       * 1. Record each upper-half player's opponent history
       * 2. Iterate through each upper-half player to find an opponent in the
       *    lower half
       * 3. Attempt to match with a lower-half opponent who isn't in their
       *    history yet AND who is in the history of other upper-half
       *    players. The second part helps eliminate a small percentage of
       *    history overlap.
       *      * (USCF § 27A1 - highest priority rule)
       * 4. If no opponent was found, try again but don't consider the
       *    history of other upper-half players.
       * 5. If still no opponent was found, just pick whoever is left in the
       *    lower half, even if they've played each other before.
       * 6. If they have played each other before, attempt to swap opponents
       *    with another upper-half player.
       * 
       * This code is certainly not the most reliable or the most efficient.
       * Changes will be needed.
       */
      /**
       * 1.
       * @var {Array} upperHalfHistory Each index matches the player's indexin upperHalf. Each sub-array is a list of their opponents.
       */
      try {
        var upperHalfHistory = upperHalf.map(p => 
          [].concat(lowerHalf).concat(upperHalf) // merge the upperHalf and lowerHalf
            .filter(p2 =>
              this.tourney.playerOppHistory(p2).includes(p) // filter the players who have played this player
            )
        );
      } catch (error) {
        console.log(score, this.playerTree[score]);
        throw error;
      }
      /**
       * 2.
       */
      upperHalf.forEach(player1 => {
        var history = upperHalfHistory[upperHalf.indexOf(player1)];
        var othersHistory = flatten(upperHalfHistory
          .slice(upperHalf.indexOf(player1))
        );
        /**
         * 3.
         */
        var [ player2, match ] = this
          ._findAMatch(player1, lowerHalf.filter(x =>
            othersHistory.includes(x)), history
        );
        /**
         * 4.
         */
        if (!player2) {
          [ player2, match ] = this._findAMatch(player1, lowerHalf, history);
        }
        /**
         * 5.
         */
        if (!player2) {
          [ player2, match ] = this._findAMatch(player1, lowerHalf, []);
        }
        /**
         * 6.
         */
        if (history.includes(player2)) {
          var foundASwap = false;
          upperHalf.filter(p => p !== player1).forEach(otherPlayer => {
            if(!foundASwap) {
              var otherMatch = this.matches
                .filter(m => m.players.includes(otherPlayer))[0];
              if(otherMatch) {
                var otherPlayer2 = otherMatch.players
                  .filter(p => p !== otherPlayer)[0];
                var otherHistory = upperHalfHistory[upperHalf
                  .indexOf(otherPlayer)];
                if (!history.includes(otherPlayer2)
                    && !otherHistory.includes(player2)) {
                  match.players = [player1, otherPlayer2];
                  otherMatch.players = [otherPlayer, player2];
                  foundASwap = true;
                }
              }
            }
          })
        }
      })
    }
  })
  return this.matches;
}
  
/**
 * Find a match for a given player.
 * @param   {Player} player1  The player to be paired
 * @param   {Array}  pool      The pool of available players
 * @param   {Array}  blackList A blacklist of players, possibly in the pool, who should not be paired
 * @returns {Array}  The paired player and the Match object. Both will be undefined if no match was made.
 */
Round.prototype._findAMatch = function(player1, pool, blackList = []) {
  /**
   * Try to pair the player as the opposite color as their last round.
   * (USCF § 27A4 and § 27A5)
   */
  var lastColor = this.prevRound.playerColor(player1);
  var hasntPlayed = pool
    .filter(p2 => !blackList.includes(p2)) // Filter anyone on the blacklist (e.g. past opponents [USCF § 27A1])
    .filter(p2 => p2 !== player1) // Don't pair players with themselves
    .filter(p2 => !flatten(this.matches.map(m => m.players)).includes(p2)); // Don't pair anyone who's already been paired
  /**
   * Prioritize opponents who played that color for *their* last round. (USCF § 27A4 and § 27A5)
   */
  var oppColor = pool
    .filter(p2 => lastColor !== this.prevRound.playerColor(p2));
  var player2 = hasntPlayed
    .filter(p2 => oppColor.includes(p2))[0] || hasntPlayed[0];
  var newMatch;
  if (player2) {
    newMatch = new Match(this, player1, player2);
    if (this.tourney.playerColorBalance(player1) > this.tourney.playerColorBalance(player2)) {
      newMatch.players.reverse();
    }
    this.matches.push(newMatch);
  }
  return [ player2, newMatch ];
}

Round.prototype.playerMatch = function(player) {
  var theMatch;
  this.matches.forEach(match => {
    if (match.players.includes(player)) {
      theMatch = match;
    }
  });
  return theMatch;
}

/**
 * Sees what color a player was for this round.
 * @param {Player} player 
 * @return {number} 0 for white and 1 for black
 */
Round.prototype.playerColor = function(player) {
  var color = -1;
  this.matches.forEach(match => {
    if (match.players.includes(player)) {
      color = match.players.indexOf(player);
    }
  })
  return color;
}

/**
 * Add a player to the roster
 *
 * @param {Player} player
 */
Round.prototype.addPlayer = function(player) {
  this.players.push(player);
  return this;
}

export default Round;