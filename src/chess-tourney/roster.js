/**
 * Create a roster object which manages a tournament's players.
 * @param {object} tourney The roster's tournament.
 * @param {array}  players A list of player objects.
 * @returns {object} The roster object.
 */
function createRoster(tourney, players = []) {
    const roster = {
        /**
         * @property {object} tourney A link to the tournemnt containing this
         * match.
         */
        tourney: tourney,
        /**
         * @param {array} all A list of all of the players.
         */
        all: players,
        /**
         * @param {array} inactive A list of the players who won't be paired in
         * future rounds.
         */
        inactive: [],
        /**
         * Get a list of players to be paired.
         * @returns {array} A list of the active players.
         */
        getActive() {
            return roster.all.filter((i) => !roster.inactive.includes(i));
        },
        /**
         * Add a player to the roster.
         * @param {object} player The player object to add.
         * @returns {object} This roster object.
         */
        addPlayer(player) {
            roster.all.push(player);
            return roster;
        },
        /**
         * Add a list of players to the roster.
         * @param {array} players A list of players to add.
         * @returns {object} This roster object.
         */
        addPlayers(players) {
            roster.all = roster.all.concat(players);
            return roster;
        },
        /**
         * Remove a player from the active roster. This player won't be placed
         * in future rounds.
         * @param {object} player The player object.
         * @returns {object} This roster object.
         */
        deactivatePlayer(player) {
            roster.inactive.push(player);
            return roster;
        },
        /**
         * Move an inactive player to the active roster to be placed in future
         * rounds.
         * @param {object} player The player object.
         * @returns {object} This roster object.
         */
        activatePlayer(player) {
            roster.inactive.splice(roster.inactive.indexOf(player), 1);
            return roster;
        },
        /**
         * Remove a player from the roster completely.
         * @param {object} player The player object.
         * @returns {object} This roster object.
         */
        removePlayer(player) {
            if (roster.tourney.getMatchesByPlayer(player).length > 0) {
                return null; // TODO: add a helpful error message
            }
            delete roster.all[roster.all.indexOf(player)];
            return roster;
        }
    };
    return roster;
}

export default Object.freeze(createRoster);