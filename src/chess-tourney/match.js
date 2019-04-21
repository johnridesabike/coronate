// @ts-check
/**
 * @typedef {import("./index").Match} Match
 */
/**
 *
 * @param {object} importObj
 */
function createMatch(importObj) {
    /** @type {Match} */
    const match = {
        players: importObj.players,
        result: [0, 0],
        origRating: importObj.origRating,
        newRating: importObj.newRating
    };
    return match;
}
export default Object.freeze(createMatch);
