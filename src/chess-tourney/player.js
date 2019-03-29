/**
 * Represents an indivudal player. Call it with `Player('John', ...)` or
 * `Player({firstName: 'John', ...})`. The latter is convenient for converting 
 * JSON objects.
 * @param {string or object} firstName
 * @param {string} lastName
 * @param {int}    rating
 */
function Player(firstName, lastName = '', rating = 1200) {
  if (!(this instanceof Player)) {
    return new Player(firstName, lastName, rating)
  }
  this.dummy = false;
  if (typeof firstName === 'object') {
    Object.assign(this, firstName)
  } else {
    this.firstName = firstName;
    this.lastName = lastName;
    this.rating = rating;
  }
}

/**
 * A stand-in for bye matches.
 * @constant {Player} DUMMYPLAYER
 */
const DUMMYPLAYER =  Player('Dummy');
DUMMYPLAYER.dummy = true;
DUMMYPLAYER.rating = 0;

export { Player, DUMMYPLAYER };