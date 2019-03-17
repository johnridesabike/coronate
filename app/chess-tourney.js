'use strict'
/* ----------------------------------------------------------------------------
*                               Chess Tourney
*
* This file handles all of the tournament logic.
* At some point, this could turn into a standalone node module.

Todo:
- Players
    - Ratings
- Pairings
    - Swiss
    - Tie-breaking
- Standings
* --------------------------------------------------------------------------- */
const Player = function (firstName, lastName, rating) {
  this.firstName = firstName
  this.lastName = lastName
  this.rating = rating
}

var players = []
var john = new Player('John', 'Jackson', 1200)

players.push(john)

module.exports.getPlayer = function (input) {
  return players[input]
}
