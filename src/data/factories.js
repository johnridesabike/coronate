/**
 * @typedef {import("./index").Match} Match
 * @typedef {import("./index").Tournament} Tournament
 * @typedef {import("./index").Player} Player
 */

/**
 *
 * @param {object} importObj
 * @returns {Match}
 */
export function createMatch(importObj) {
    return {
        id: importObj.id,
        players: importObj.players,
        result: importObj.result || [0, 0],
        origRating: importObj.origRating,
        newRating: importObj.newRating
    };
}

/**
 * @param {Object} importObj
 * @returns {Player}
 */
export function createPlayer(importObj = {}) {
    return {
        id: importObj.id || 0,
        type: importObj.type || "person", // used for CSS styling etc.
        firstName: importObj.firstName || "",
        lastName: importObj.lastName || "",
        rating: importObj.rating || 0,
        matchCount: importObj.matchCount || 0
    };
}

/**
 * @param {Object} importObj
 * @returns {Tournament}
 */
export function createTournament(importObj) {
    return {
        name: importObj.name || "",
        tieBreaks: importObj.tieBreaks || [0, 1, 2, 3],
        byeQueue: importObj.byeQueue || [],
        players: importObj.players || [],
        roundList: importObj.roundList || []
    };
}
