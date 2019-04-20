// @ts-check
import EloRank from "elo-rank";

function createPlayer(importObj = {}) {
    const player = {
        /** @type {number} */
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
        }
    };
    return player;
}
export default Object.freeze(createPlayer);

const dummyPlayer = createPlayer();
dummyPlayer.id = -1;
dummyPlayer.firstName = "Bye";
dummyPlayer.dummy = true;
Object.freeze(dummyPlayer);
export {dummyPlayer};


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
 * @returns {number[]}
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