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
 * @property {function(): number} getKFactor
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
 * @property {number[]} [avoidList]
 */
/**
 *
 * @param {playerProps} importObj
 * @returns {Player}
 */
function createPlayer(importObj = {}) {
    /** @type {Player} */
    const player = {
        id: importObj.id || 0,
        firstName: importObj.firstName || "",
        lastName: importObj.lastName || "",
        rating: importObj.rating || 0,
        dummy: importObj.dummy || false,
        matchCount: importObj.matchCount || 0,
        getKFactor() {
            const ne = player.matchCount || 1;
            return (800 / ne);
        },
        getEloRank() {
            return new EloRank(player.getKFactor());
        },
        hasHadBye(tourney) {
            return tourney.getPlayersByOpponent(
                player,
                null
            ).includes(dummyPlayer);
        }
    };
    return player;
}

/** @type {Player} */
const dummyPlayer = createPlayer();
dummyPlayer.id = -1;
dummyPlayer.firstName = "Bye";
dummyPlayer.dummy = true;
Object.freeze(dummyPlayer);

export {dummyPlayer, createPlayer};