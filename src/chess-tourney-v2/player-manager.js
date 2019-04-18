// @ts-check
import {dummyPlayer} from "./player";
/**
 * @typedef {Object} PlayerManager
 * @property {object[]} playerList
 * @property {number[][]} avoidList
*/

function createPlayerManager() {
    /** @type {PlayerManager} */
    const manager = {
        playerList: [],
        avoidList: []
    };
    return manager;
}
export default Object.freeze(createPlayerManager);

/**
 * @param {number} id
 * @param {object[]} playerList
 */
function getPlayer(id, playerList) {
    if (id === -1) {
        return dummyPlayer;
    }
    return playerList.filter((p) => p.id === id)[0];
}
Object.freeze(getPlayer);
export {getPlayer};

/**
 * @param {number} playerId
 * @param {number[][]} avoidList
 */
function getPlayerAvoidList(playerId, avoidList) {
    return avoidList.filter( // get pairings with the player
        (pair) => pair.includes(playerId)
    ).reduce( // Flatten the array
        (accumulator, pair) => pair.concat(accumulator),
        []
    ).filter( // filter out the player's id
        (id) => id !== playerId
    );
}
Object.freeze(getPlayerAvoidList);
export {getPlayerAvoidList};

/**
 * @param {number[][]} avoidList
 * @param {object[]} playerList
 */
function cleanAvoidList(avoidList, playerList) {
    const ids = playerList.map((p) => p.id);
    return avoidList.filter(
        (pairs) => (ids.includes(pairs[0]) && ids.includes(pairs[1]))
    );
}
Object.freeze(cleanAvoidList);
export {cleanAvoidList};