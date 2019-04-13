// @flow
import EloRank from "elo-rank";
/*::
import type {tournament, player, playerManager, defPlayer} from "./flow-types";
*/

const defaultPlayer/*:defPlayer*/ = {
    id: 0,
    firstName: "",
    lastName: "",
    rating: 0,
    dummy: false,
    matchCount: 0
};

/**
 * Represents an indivudal player. Call it with `createPlayer("John", ...)` or
 * `createPlayer({firstName: "John", ...})`. The latter is convenient for
 * converting JSON objects.
 * @param {object} firstName Either the person's first name or an object
 * containing all the parameters.
 * @param {string} lastName  The person's last name.
 * @param {int}    rating    The person's Elo rating.
 */

function createPlayer(importObj/*:defPlayer*/ = defaultPlayer) {
    const player/*:player*/ = {
        /**
         * @property {number} id The ID number of the player. Used mainly for
         * JSON serialization.
         */
        id: importObj.id || defaultPlayer.id,
        /**
         * @property {string} firstName The person's first name.
         */
        firstName: importObj.firstName || defaultPlayer.firstName,
        /**
         * @property {string} lastName The person's last name.
         */
        lastName: importObj.lastName || defaultPlayer.lastName,
        /**
         * @property {number} rating The person's Elo rating.
         */
        rating: importObj.rating || defaultPlayer.rating,
        /**
         * @property {bool} dummy If true, this player won't count in certain
         * scorings.
         */
        dummy: importObj.dummy || defaultPlayer.dummy,
        /**
         * @property {number} matchCount Number of games the rating is based on.
         */
        matchCount: importObj.matchCount || defaultPlayer.matchCount,
        /**
         * Create an Elo calculator with an updated K-factor. See the `elo-rank`
         * NPM package for more information.
         * @param {object} tourney The current tournament.
         * @returns {object} An `EloRank` object.
         */
        getEloRank() {
            const ne = player.matchCount || 1;
            const K = (800 / ne);
            return new EloRank(K);
        },
        /**
         * Get if a player has had a bye round.
         * @param {object} tourney The current tournament.
         * @returns {bool} True if the player has had a bye round, false if not.
         * TODO: move this to the tournament object?
         */
        hasHadBye(tourney/*:tournament*/) {
            return tourney.getPlayersByOpponent(player).includes(dummyPlayer);
        },
        toJSON(key/*:string*/) {
            if (key && player.isReference) {
                return player.id;
            } else {
                return player;
            }
        }
    };
    return player;
}

/**
 * A stand-in for bye matches.
 * @constant {object} dummyPlayer
 */
const dummyPlayer = createPlayer();
dummyPlayer.id = -1;
dummyPlayer.firstName = "Bye";
dummyPlayer.dummy = true;
Object.freeze(dummyPlayer);

const defaultPlayerManager/*:defaultPlayerManager*/ = {

};

function createPlayerManager(
    importObj/*:playerManager*/ = defaultPlayerManager,
    playerSource/*:?playerManager*/ = null
) {
    const pManager/*:playerManager*/ = {
        roster: [], // this gets added later
        lastId: importObj.lastId || -1,
        /**
         * @property {object} ref_tourney A reference to the tournemnt
         * containing this match.
         */
        ref_tourney: importObj.ref_tourney || null,
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
            return pManager.roster.filter(
                (i) => !pManager.inactive.includes(i)
            );
        },
        importPlayerById(fromRoster/*:playerManager*/, playerId/*:number*/) {
            let player = fromRoster.getPlayerById(playerId);
            pManager.roster.push(player);
            return pManager;
        },
        importPlayerList(playerList/*:Array<player>*/) {
            pManager.roster = playerList;
            return pManager;
        },
        /**
         * Remove a player from the active pManager. This player won't be placed
         * in future rounds.
         * @param {object} player The player object.
         * @returns {object} This roster object.
         */
        deactivatePlayer(player/*:player*/) {
            pManager.inactive.push(player);
            return pManager;
        },
        /**
         * Move an inactive player to the active roster to be placed in future
         * rounds.
         * @param {object} player The player object.
         * @returns {object} This roster object.
         */
        activatePlayer(player/*:player*/) {
            pManager.inactive.splice(pManager.inactive.indexOf(player), 1);
            return pManager;
        },
        /**
         * Remove a player from the roster completely.
         * @param {object} player The player object.
         * @returns {object} This roster object.
         */
        removePlayer(player/*:player*/) {
            if (pManager.canRemovePlayer(player)) {
                return null; // TODO: add a helpful error message
            }
            delete pManager.roster[pManager.roster.indexOf(player)];
            return pManager;
        },
        removePlayerById(id/*:number*/) {
            pManager.removePlayer(pManager.getPlayerById(id));
            return pManager;
        },
        getPlayerById(id/*:number*/) {
            let player/*:player*/;
            if (id === -1) {
                player = dummyPlayer;
            }
            player = pManager.roster.filter((p) => p.id === id)[0];
            return player;
        },
        canRemovePlayer(player/*:player*/) {
            return (pManager.ref_tourney.getMatchesByPlayer(player).length > 0);
        },
        canRemovePlayerById(id/*:number*/) {
            return pManager.canRemovePlayer(pManager.getPlayerById(id));
        },
        setByIdList(playerManager/*:playerManager*/, list/*:Array<number>*/) {
            const currentIds = pManager.roster.map((p) => p.id);
            const toAdd = list.filter((id) => !currentIds.includes(id));
            const toRemove = currentIds.filter((id) => !list.includes(id));
            toAdd.forEach((id) => pManager.importPlayerById(playerManager, id));
            toRemove.forEach((id) => pManager.removePlayerById(id));
        },
        /**
         * Add a player to the pManager.
         * @param {object} player The player object to add.
         * @returns {object} This created player object.
         */
        addPlayer(playerData/*:player*/) {
            playerData.id = pManager.lastId + 1;
            pManager.lastId = playerData.id;
            let player = createPlayer(playerData);
            pManager.roster.push(player);
            return player;
        },
        /**
         * Add a list of players to the pManager.
         * @param {array} players A list of players to add.
         * @returns {array} The list of created player objects.
         */
        addPlayers(playersData/*:Array<player>*/) {
            let newPlayerList = playersData.map(
                (player) => pManager.addPlayer(player)
            );
            return newPlayerList;
        },
        loadPlayerData(data/*:Array<player>*/) {
            pManager.roster = data.map(
                (player) => createPlayer(player)
            );
        },
        delPlayer(playerId) {
            let index = pManager.roster.map(
                (p) => p.id
            ).indexOf(
                Number(playerId)
            );
            if (index === -1) {
                return null;
            }
            let player = pManager.roster.splice(index, 1);
            return player;
        }
    };
    if (importObj.roster) {
        importObj.roster.forEach(function (player) {
            if (typeof player === "number") {
                pManager.importPlayerById(playerSource, player);
            } else {
                pManager.addPlayer(player);
            }
        });
    }
    return pManager;
}

export {dummyPlayer, createPlayer, createPlayerManager, defaultPlayerManager};