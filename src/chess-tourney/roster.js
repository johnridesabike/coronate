/**
 * Roster class.
 * @param {Array} players
 */
function newRoster(tourney, players = []) {
    const roster = {
        tourney: tourney,
        all: players,
        inactive: [],
        getActive: function () {
            return roster.all.filter((i) => !roster.inactive.includes(i));
        },
        /**
         * Add a player to the roster.
         * @param {Player} player the player to add
         */
        addPlayer: function (player) {
            roster.all.push(player);
            return roster;
        },
        /**
         * Add a list of players to the roster.
         * @param {Array} players the list of players to add
         */
        addPlayers: function (players) {
            roster.all = roster.all.concat(players);
            return roster;
        },
        /**
         * Remove a player from the active roster. This player won't be placed
         * in future rounds.
         * @param {Player} player
         */
        deactivatePlayer: function (player) {
            roster.inactive.push(player);
            return roster;
        },
        /**
         * Add a player to the active roster. This player will be placed in
         * future rounds.
         * @param {Player} player
         */
        activatePlayer: function (player) {
            roster.inactive.splice(roster.inactive.indexOf(player), 1);
            return roster;
        },
        removePlayer: function (player) {
            if (roster.tourney.getMatchesByPlayer(player).length > 0) {
                return null; // TODO: add a helpful error message
            }
            delete roster.all[roster.all.indexOf(player)];
            return roster;
        }
    };
    return roster;
}

export default Object.freeze(newRoster);