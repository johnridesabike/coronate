// @ts-check
import EloRank from "elo-rank";
/**
 * @typedef {import("./tournament").tournament} tournament
 */
/**
 * @typedef {Object} player
 * @property {number} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {number} rating
 * @property {boolean} dummy
 * @property {number} matchCount
 * @property {function(): Object} getEloRank
 * @property {function(tournament): boolean} hasHadBye
 */
/**
 * @typedef {Object} playerProps
 * @property {number} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {number} rating
 * @property {boolean} dummy
 * @property {number} matchCount
 */

/**
 * @type {playerProps}
 */
const defPlayer = {
    id: 0,
    firstName: "",
    lastName: "",
    rating: 0,
    dummy: false,
    matchCount: 0
};

/**
 *
 * @param {playerProps} importObj
 * @returns {player}
 */
function createPlayer(importObj = defPlayer) {
    /**
     * @type {player}
     */
    const newPlayer = {
        id: importObj.id || defPlayer.id,
        firstName: importObj.firstName || defPlayer.firstName,
        lastName: importObj.lastName || defPlayer.lastName,
        rating: importObj.rating || defPlayer.rating,
        dummy: importObj.dummy || defPlayer.dummy,
        matchCount: importObj.matchCount || defPlayer.matchCount,
        getEloRank() {
            const ne = newPlayer.matchCount || 1;
            const K = (800 / ne);
            return new EloRank(K);
        },
        hasHadBye(tourney) {
            return tourney.getPlayersByOpponent(
                newPlayer,
                null
            ).includes(dummyPlayer);
        }
    };
    return newPlayer;
}

/**
 * @type {player}
 */
const dummyPlayer = createPlayer();
dummyPlayer.id = -1;
dummyPlayer.firstName = "Bye";
dummyPlayer.dummy = true;
Object.freeze(dummyPlayer);

export {dummyPlayer, createPlayer};