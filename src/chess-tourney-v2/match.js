// @ts-check
import {dummyPlayer} from "./player";

/**
 *
 * @param {object} importObj
 */
function createMatch(importObj) {
    const [white, black] = importObj.roster;
    const match = {
        /** @type {string} */
        id: white + "." + black,
        /** @type {number[]} */
        roster: importObj.roster,
        /** @type {number[]} */
        result: []
    };
    return match;
}
export default Object.freeze(createMatch);
