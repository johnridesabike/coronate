import EloRank from 'elo-rank';

/**
 * Represents an indivudal player. Call it with `Player('John', ...)` or
 * `Player({firstName: 'John', ...})`. The latter is convenient for converting 
 * JSON objects.
 * @param {string or object} firstName
 * @param {string} lastName
 * @param {int}    rating
 */
export function Player(firstName, lastName = '', rating = 1200) {
  if (!(this instanceof Player)) {
    return new Player(firstName, lastName, rating)
  }
  this.dummy = false;
  this.Ne = 0 // number of games the rating is based on
  if (typeof firstName === 'object') {
    Object.assign(this, firstName)
  } else {
    this.firstName = firstName;
    this.lastName = lastName;
    this.rating = rating;
  }
}

Player.prototype.eloRank = function(match) {
  const m = match.round.tourney.playerMatchHistory(this).length;
  const K = 800 / (this.Ne + m);
  return new EloRank(K);
}

/**
 * A stand-in for bye matches.
 * @constant {Player} DUMMYPLAYER
 */
export const DUMMYPLAYER = Player('Dummy');
DUMMYPLAYER.dummy = true;
DUMMYPLAYER.rating = 0;