// @ts-check
import EloRank from "elo-rank";
import {WHITE, BLACK} from "./constants";
/**
 * @typedef {import("./index").Player} Player
 */

function createPlayer(importObj = {}) {
    /** @type {Player} */
    const player = {
        id: importObj.id || 0,
        type: importObj.type || "person", // used for CSS styling etc.
        firstName: importObj.firstName || "",
        lastName: importObj.lastName || "",
        rating: importObj.rating || 0,
        matchCount: importObj.matchCount || 0
    };
    return player;
}
Object.freeze(createPlayer);
export {createPlayer};

const dummyPlayer = createPlayer();
dummyPlayer.id = -1;
dummyPlayer.firstName = "Bye";
dummyPlayer.lastName = "Player";
dummyPlayer.type = "dummy";
Object.freeze(dummyPlayer);
export {dummyPlayer};


/**
 * @param {number} id
 * @param {Player[]} playerList
 * @returns {Player}
 */
function getPlayer(id, playerList) {
    if (id === -1) {
        return dummyPlayer;
    }
    let player = playerList.filter((p) => p.id === id)[0];
    if (!player) {
        player = createPlayer({
            id: id,
            firstName: "Anonymous",
            type: "missing"
        });
    }
    return player;
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
 * @param {Player[]} playerList
 */
function cleanAvoidList(avoidList, playerList) {
    const ids = playerList.map((p) => p.id);
    return avoidList.filter(
        (pairs) => (ids.includes(pairs[0]) && ids.includes(pairs[1]))
    );
}
Object.freeze(cleanAvoidList);
export {cleanAvoidList};

/**
 * @param {number} matchCount
 */
function kFactor(matchCount) {
    const ne = matchCount || 1;
    return (800 / ne);
}
Object.freeze(kFactor);
export {kFactor};

/**
 * @param {[number, number]} origRatings
 * @param {[number, number]} matchCounts
 * @param {[number, number]} result
 */
function calcNewRatings(origRatings, matchCounts, result) {
    const whiteElo = new EloRank(kFactor(matchCounts[WHITE]));
    const blackElo = new EloRank(kFactor(matchCounts[BLACK]));
    const FLOOR = 100;
    const scoreExpected = [
        whiteElo.getExpected(origRatings[WHITE], origRatings[BLACK]),
        blackElo.getExpected(origRatings[BLACK], origRatings[WHITE])
    ];
    const newRating = [
        whiteElo.updateRating(
            scoreExpected[WHITE],
            result[WHITE],
            origRatings[WHITE]
        ),
        blackElo.updateRating(
            scoreExpected[BLACK],
            result[BLACK],
            origRatings[BLACK]
        )
    ];
    return newRating.map(
        (rating) => (
            (rating < FLOOR)
            ? FLOOR
            : rating
        )
    );
}
Object.freeze(calcNewRatings);
export {calcNewRatings};