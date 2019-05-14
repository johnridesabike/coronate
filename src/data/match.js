/**
 * @typedef {import("./index").Match} Match
 */
/**
 *
 * @param {object} importObj
 */
export default function createMatch(importObj) {
    /** @type {Match} */
    const match = {
        id: importObj.id,
        players: importObj.players,
        result: importObj.result || [0, 0],
        origRating: importObj.origRating,
        newRating: importObj.newRating
    };
    return match;
}
