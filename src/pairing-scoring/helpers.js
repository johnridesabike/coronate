// TODO: Clean this up. Refactor unnecessary functions, etc.
import {init, pipe, tail} from "ramda";
import t from "tcomb";
import {WHITE, BLACK, DUMMY_ID} from "./constants";
import {createPlayer, dummyPlayer, RoundList} from "../factories";

const ScoreCalculator = t.func(
    [t.Number, RoundList, t.maybe(t.Number)],
    t.Any
);
export {ScoreCalculator};

/**
 * @returns {boolean}
 */
function isBye(match) {
    return match.players.includes(DUMMY_ID);
}

/**
 * @returns {boolean}
 */
export function isNotBye(match) {
    return !isBye(match);
}

/**
 * @param {number} playerId
 */
export function isNotDummy(playerId) {
    return playerId !== DUMMY_ID;
}

/**
 * @param {typeof WHITE | typeof BLACK} color
 */
export function switchColor(color) {
    return ( // return the opposite color
        (color === WHITE)
        ? BLACK
        : WHITE
    );
}

const getMatchesByPlayer = ScoreCalculator.of(
    function (playerId, roundList, roundId = null) {
        const rounds = (
            (roundId === null)
            ? roundList
            : roundList.slice(0, roundId + 1)
        );
        return rounds.reduce( // flatten the rounds to just the matches
            (acc, round) => acc.concat(round),
            []
        ).filter(
            (match) => match.players.includes(playerId)
        );
    }
);
export {getMatchesByPlayer};

/**
 * Helper function.
 * @param {Standing} standing1
 * @param {Standing} standing2
 * @returns {boolean}
 */
export function areScoresEqual(standing1, standing2) {
    // Check if any of them aren't equal
    if (standing1.score !== standing2.score) {
        return false;
    }
    // Check if any values are not equal
    return !(
        standing1.tieBreaks.reduce(
            /** @param {boolean[]} acc */
            (acc, value, i) => acc.concat(value !== standing2.tieBreaks[i]),
            []
        ).includes(true)
    );
}

/**
 * @returns {number[]}
 */
export function getAllPlayers(roundList) {
    const allPlayers = roundList.reduce( // flatten the rounds
        (acc, round) => acc.concat(round),
        []
    ).reduce( // flaten the players
        (acc, match) => acc.concat(match.players),
        []
    );
    return Array.from(new Set(allPlayers));
}

/**
 * Get a list of all of a player's scores from each match.
 * @returns {number[]} the list of scores
 */
const playerScoreList = ScoreCalculator.of(
    function (playerId, roundList, roundId = null) {
        return getMatchesByPlayer(
            playerId,
            roundList,
            roundId
        ).map(
            (match) => match.result[match.players.indexOf(playerId)]
        );
    }
);
export {playerScoreList};

/** @type {(scores: number[]) => number[]} */
// @ts-ignore
const removeFirstAndLast = pipe(init, tail);
export {removeFirstAndLast};


/**
 * @param {number} playerId
 * @param {object[]} matchList
 * @returns {typeof WHITE | typeof BLACK?}
 */
export function playerMatchColor(playerId, matchList) {
    const match = matchList.filter((m) => m.players.includes(playerId))[0];
    return (
        (match)
        ? match.players.indexOf(playerId)
        : null
    );
}

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

export function cleanAvoidList(avoidList, playerList) {
    const ids = playerList.map((p) => p.id);
    return avoidList.filter(
        (pairs) => (ids.includes(pairs[0]) && ids.includes(pairs[1]))
    );
}

/**
 * @param {number} playerCount
 */
export function calcNumOfRounds(playerCount) {
    const rounds = Math.ceil(Math.log2(playerCount));
    return (
        (Number.isFinite(rounds))
        ? rounds
        : 0
    );
}

/**
 * @template {object} T
 * @param {T[]} list
 * @param {number | string} id
 * @returns {T}
 */
export function getById(list, id) {
    return list.filter((x) => x.id === id)[0];
}

/**
 * @param {Object[]} list
 * @param {number | string} id
 */
export function getIndexById(list, id) {
    return list.indexOf(getById(list, id));
}
