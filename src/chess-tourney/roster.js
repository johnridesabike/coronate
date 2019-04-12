import {createPlayer} from "./player";
/**
 * Create a roster object which manages a tournament's players.
 * @param {object} tourney The roster's tournament.
 * @param {array}  players A list of player objects.
 * @returns {object} The roster object.
 */
function createRoster(tourney, importObj = null) {
    const roster = {
        /**
         * @property {object} ref_tourney A reference to the tournemnt
         * containing this match.
         */
        ref_tourney: tourney,
        /**
         * @param {array} all A list of all of the players.
         */
        all: [],
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
        importPlayerById(globalRoster, playerId) {
            let player = globalRoster.getPlayerById(playerId);
            roster.all.push(player);
            return roster;
        },
        importPlayerIdsList(playerIdList) {
            playerIdList.map((id) => roster.importPlayer(id));
            return roster;
        },
        importPlayerList(playerList) {
            roster.all = playerList;
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
            if (roster.canRemovePlayer(player)) {
                return null; // TODO: add a helpful error message
            }
            delete roster.all[roster.all.indexOf(player)];
            return roster;
        },
        removePlayerById(playerId) {
            roster.removePlayer(roster.getPlayerById(playerId));
            return roster;
        },
        getPlayerById(id) {
            return roster.all.filter((p) => p.id === id)[0];
        },
        canRemovePlayer(player) {
            return (roster.ref_tourney.getMatchesByPlayer(player).length > 0);
        },
        canRemovePlayerById(id) {
            return roster.canRemovePlayer(roster.getPlayerById(id));
        },
        setByIdList(playerManager, list) {
            const currentIds = roster.all.map((p) => p.id);
            const toAdd = list.filter((id) => !currentIds.includes(id));
            const toRemove = currentIds.filter((id) => !list.includes(id));
            toAdd.forEach((id) => roster.importPlayerById(playerManager, id));
            toRemove.forEach((id) => roster.removePlayerById(id));
        }
    };
    // Importing JSON-parsed data
    if (importObj) {
        // Turn the player IDs into player objects
        importObj.all.forEach(
            (pId) => roster.importPlayer(pId)
        );
        roster.inactive = importObj.inactive.map(
            (pId) => roster.getPlayerById(pId)
        );
    }
    return roster;
}

export default Object.freeze(createRoster);