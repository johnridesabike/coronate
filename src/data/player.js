import EloRank from "elo-rank";
import {WHITE, BLACK, DUMMY_ID} from "./constants";
import {createPlayer} from "./factories";
/**
 * @typedef {import("./index").Player} Player
*/

const dummyPlayer = createPlayer({
    id: -1,
    firstName: "Bye",
    lastName: "Player",
    type: "dummy"
});
Object.freeze(dummyPlayer);
export {dummyPlayer};


/**
 * @param {Player[]} playerList
 * @param {number} id
 * @returns {Player}
 */
export function getPlayerById(playerList, id) {
    if (id === DUMMY_ID) {
        return dummyPlayer;
    }
    const player = playerList.filter((p) => p.id === id)[0];
    return (
        (player)
        ? player
        : createPlayer({
            id: id,
            firstName: "Anonymous",
            type: "missing"
        })
    );
}

/**
 * @param {number} playerId
 * @param {number[][]} avoidList
 * @returns {number[]}
 */
export function getPlayerAvoidList(playerId, avoidList) {
    return avoidList.filter( // get pairings with the player
        (pair) => pair.includes(playerId)
    ).reduce( // Flatten the array
        (accumulator, pair) => pair.concat(accumulator),
        []
    ).filter( // filter out the player's id
        (id) => id !== playerId
    );
}

/**
 * @param {number[][]} avoidList
 * @param {Player[]} playerList
 */
export function cleanAvoidList(avoidList, playerList) {
    const ids = playerList.map((p) => p.id);
    return avoidList.filter(
        (pairs) => (ids.includes(pairs[0]) && ids.includes(pairs[1]))
    );
}

/**
 * @param {number} matchCount
 */
export function kFactor(matchCount) {
    const ne = matchCount || 1;
    return (800 / ne);
}

/**
 * @param {[number, number]} origRatings
 * @param {[number, number]} matchCounts
 * @param {[number, number]} result
 * @returns {[number, number]}
 */
export function calcNewRatings(origRatings, matchCounts, result) {
    const whiteElo = new EloRank(kFactor(matchCounts[WHITE]));
    const blackElo = new EloRank(kFactor(matchCounts[BLACK]));
    const FLOOR = 100;
    const scoreExpected = [
        whiteElo.getExpected(origRatings[WHITE], origRatings[BLACK]),
        blackElo.getExpected(origRatings[BLACK], origRatings[WHITE])
    ];
    /** @type {[number, number]} */
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
    // @ts-ignore
    return newRating.map(
        (rating) => (
            rating < FLOOR
            ? FLOOR
            : rating
        )
    );
}
