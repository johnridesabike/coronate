/**
 * Roster class.
 * @param {Array} players 
 */
function Roster(players = []) {
  if (!(this instanceof Roster)) {
    return new Roster(players)
  }
  this.all = players;
  this.inactive = [];
}

Object.defineProperties(
  Roster.prototype,
  {
    active: {
      get: function() { return this.all.filter(i => !this.inactive.includes(i)) }
    }
  }
);

export default Roster;