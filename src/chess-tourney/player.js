// @ts-check
import EloRank from "elo-rank";
/**
 * @typedef {import("./tournament").Tournament} Tournament
 */
/**
 * @typedef {Object} Player
 * @property {number} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {number} rating
 * @property {boolean} dummy
 * @property {number} matchCount
 * @property {function(): Object} getEloRank
 * @property {function(Tournament): boolean} hasHadBye
 */
/**
 * @typedef {Object} playerProps
 * @property {number} [id]
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {number} [rating]
 * @property {boolean} [dummy]
 * @property {number} [matchCount]
 */
/**
 *
 * @param {playerProps} importObj
 * @returns {Player}
 */
function createPlayer(importObj = {}) {
    /**
     * @type {Player}
     */
    const newPlayer = {
        id: importObj.id || 0,
        firstName: importObj.firstName || "",
        lastName: importObj.lastName || "",
        rating: importObj.rating || 0,
        dummy: importObj.dummy || false,
        matchCount: importObj.matchCount || 0,
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
 * @type {Player}
 */
const dummyPlayer = createPlayer();
dummyPlayer.id = -1;
dummyPlayer.firstName = "Bye";
dummyPlayer.dummy = true;
Object.freeze(dummyPlayer);

export {dummyPlayer, createPlayer};