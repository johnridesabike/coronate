/**
 * Roster class.
 * @param {Array} players 
 */
export default function Roster(players = [], tourney) {
  if (!(this instanceof Roster)) {
    return new Roster(players, tourney)
  }
  this.all = players;
  this.tourney = tourney;
  this.inactive = [];
}

Object.defineProperties(
  Roster.prototype,
  {
    active: {
      get: function() {
        return this.all.filter(i => !this.inactive.includes(i))
      }
    }
  }
);

/**
 * Add a player to the roster.
 * @param {Player} player the player to add
 */
Roster.prototype.addPlayer = function(player) {
  this.all.push(player);
  return this;
}

/**
 * Add a list of players to the roster.
 * @param {Array} players the list of players to add
 */
Roster.prototype.addPlayers = function(players) {
  this.all = this.all.concat(players);
  return this;
}

/**
 * Remove a player from the active roster. This player won't be placed in
 * future rounds.
 * @param {Player} player 
 */
Roster.prototype.deactivatePlayer = function(player) {
  this.inactive.push(player);
  return this;
}

/**
 * Add a player to the active roster. This player will be placed in future
 * rounds.
 * @param {Player} player 
 */
Roster.prototype.activatePlayer = function(player) {
  this.inactive.splice(this.inactive.indexOf(player), 1);
  return this;
}

Roster.prototype.removePlayer = function(player) {
  if (this.tourney.playerMatchHistory(player).length > 0) {
    return null; // TODO: add a helpful error message
  }
  delete this.all[this.all.indexOf(player)];
  return this;
}
