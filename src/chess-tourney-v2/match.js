// @ts-check
/**
 *
 * @param {object} importObj
 */
function createMatch(importObj) {
    const match = {
        /** @type {number[]} */
        players: importObj.players,
        /** @type {number[]} */
        result: [0, 0],
        /** @type {number[]} */
        origRating: importObj.origRating,
        /** @type {number[]} */
        newRating: importObj.newRating
    };
    return match;
}
export default Object.freeze(createMatch);
