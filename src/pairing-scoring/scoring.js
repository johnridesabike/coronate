import {last, pipe, remove, sort, sum, assoc} from "ramda";
import {firstBy} from "thenby";
import {getPlayerById, getPlayerAvoidList} from "../data/player";
import {WHITE, BLACK, DUMMY_ID} from "../data/constants";

/**
 * @typedef {import("./").ScoreCalculator} ScoreCalculator
 * @typedef {import("./").PlayerData} PlayerData
 * @typedef {import("./").Standing} Standing
 * @typedef {import("../data").Match} Match
 * @typedef {import("../data").Player} Player
 */

/**
 *
 * @param {Match} match
 * @returns {boolean}
 */
function isBye(match) {
    return match.players.includes(DUMMY_ID);
}

/**
 * @param {typeof WHITE | typeof BLACK} color
 */
function switchColor(color) {
    return ( // return the opposite color
        (color === WHITE)
        ? BLACK
        : WHITE
    );
}

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

/**
 * @type {ScoreCalculator}
 * @returns {Match[]}
 */
function getMatchesByPlayer(playerId, roundList, roundId = null) {
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

/**
 * @type {ScoreCalculator}
 * @returns {boolean}
 */
export function hasHadBye(playerId, roundList, roundId = null) {
    return getMatchesByPlayer(
        playerId,
        roundList,
        roundId
    ).reduce(
        (acc, match) => acc.concat(match.players),
        []
    ).includes(DUMMY_ID);
}

/**
 * @type {ScoreCalculator}
 * @returns {number[]}
 */
export function getPlayersByOpponent(opponentId, roundList, roundId = null) {
    return getMatchesByPlayer(
        opponentId,
        roundList,
        roundId
    ).reduce(
        (acc, match) => acc.concat(match.players),
        []
    ).filter(
        (playerId) => playerId !== opponentId
    );
}

/**
 * Get a list of all of a player's scores from each match.
 * @type {ScoreCalculator}
 * @returns {number[]} the list of scores
 */
function playerScoreList(playerId, roundList, roundId = null) {
    return getMatchesByPlayer(playerId, roundList, roundId).map(
        (match) => match.result[match.players.indexOf(playerId)]
    );
}

/**
 * TODO: Maybe merge this with the other function?
 */
/**
 * @type {ScoreCalculator}
 * @returns {number[]}
 */
function playerScoreListNoByes(playerId, roundList, roundId = null) {
    return getMatchesByPlayer(
        playerId,
        roundList,
        roundId
    ).filter(
        (match) => !isBye(match)
    ).map(
        (match) => match.result[match.players.indexOf(playerId)]
    );
}

/**
 * @type {ScoreCalculator}
 * @returns {number}
 */
export function playerScore(playerId, roundList, roundId = null) {
    const scoreList = playerScoreList(playerId, roundList, roundId);
    return sum(scoreList);
}

/**
 * The player's cumulative score.
 * @type {ScoreCalculator}
 * @returns {number}
 */
function playerScoreCum(playerId, roundList, roundId = null) {
    const scoreList = playerScoreListNoByes(
        playerId,
        roundList,
        roundId
    ).reduce( // turn the regular score list into a "running" score list
        (acc, score) => acc.concat([last(acc) + score]),
        [0]
    );
    return sum(scoreList);
}

/**
 * Calculate a player's color balance. A negative number means they played as
 * white more. A positive number means they played as black more.
 * @type {ScoreCalculator}
 * @returns {number}
 */
export function playerColorBalance(playerId, roundList, roundId = null) {
    const colorList = getMatchesByPlayer(
        playerId,
        roundList,
        roundId
    ).filter(
        (match) => !isBye(match)
    ).reduce(
        (acc, match) => (
            (match.players[WHITE] === playerId)
            ? acc.concat(-1) // White = -1
            : acc.concat(1) // Black = +1
        ),
        [0]
    );
    return sum(colorList);
}

/**
 * Used for `modifiedMedian` and `solkoff`.
 * @type {ScoreCalculator}
 * @returns {number[]}
 */
function opponentScores(pId, roundList, roundId) {
    const scores = getPlayersByOpponent(
        pId,
        roundList,
        roundId
    ).filter(
        (opponent) => opponent !== DUMMY_ID
    ).map(
        (opponent) => playerScore(opponent, roundList, roundId)
    );
    return sort((a, b) => a - b, scores);
}

/**
 * Gets the modified median factor defined in USCF § 34E1
 * @type {ScoreCalculator}
 * @returns {number}
 */
function modifiedMedian(playerId, roundList, roundId = null) {
    const scores = opponentScores(playerId, roundList, roundId);
    const trimmedScores = pipe(remove(-1, 1), remove(0, 1))(scores);
    return (
        (trimmedScores.length > 0)
        ? trimmedScores.reduce((a, b) => a + b)
        : 0
    );
}

/**
 * @type {ScoreCalculator}
 * @returns {number}
 */
function solkoff(playerId, roundList, roundId = null) {
    const scoreList = opponentScores(playerId, roundList, roundId);
    return sum(scoreList);
}

/**
 * Get the cumulative scores of a player's opponents.
 * @type {ScoreCalculator}
 * @returns {number}
 */
function playerOppScoreCum(playerId, roundList, roundId = null) {
    const opponents = getPlayersByOpponent(
        playerId,
        roundList,
        roundId
    ).filter(
        (opponent) => opponent !== DUMMY_ID
    );
    const oppScores = opponents.map(
        (p) => playerScoreCum(p, roundList, roundId)
    );
    return sum(oppScores);
}

const tieBreakMethods = [
    {
        name: "Modified median",
        func: modifiedMedian
    },
    {
        name: "Solkoff",
        func: solkoff
    },
    {
        name: "Cumulative score",
        func: playerScoreCum
    },
    {
        name: "Cumulative of opposition",
        func: playerOppScoreCum
    },
    {
        name: "Most black",
        func: playerColorBalance
    }
];

Object.freeze(tieBreakMethods);
export {tieBreakMethods};

/**
 * Helper function.
 * @param {Standing} standing1
 * @param {Standing} standing2
 * @returns {boolean}
 */
function areScoresEqual(standing1, standing2) {
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
 * @param {Match[][]} roundList
 * @returns {number[]}
 */
function getAllPlayers(roundList) {
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
 * Sort the standings by score, see USCF tie-break rules from § 34.
 * @param {number[]} methods
 * @param {Match[][]} roundList
 * @param {number} [roundId]
 * @returns {[Standing[][], string[]]} The standings and the list of method used
 */
export function calcStandings(methods, roundList, roundId = null) {
    const tieBreaks = methods.map((m) => tieBreakMethods[m]);
    // Get a flat list of all of the players and their scores.
    const standingsFlat = getAllPlayers(roundList).map(
        (pId) => ({
            id: pId,
            score: playerScore(pId, roundList, roundId),
            tieBreaks: tieBreaks.map(
                (method) => (method.func(pId, roundList, roundId))
            )
        })
    );
    // // Create a function to sort the players
    const sortFunc = tieBreaks.reduce(
        (acc, ignore, index) => (
            acc.thenBy((standing) => standing.tieBreaks[index], -1)
        ),
        firstBy((standing) => standing.score, -1)
    );
    // Finally, sort the players.
    const standingsFlatSorted = sort(sortFunc, standingsFlat);
    /** @type {Standing[][]} */
    const standingsTree = [];
    let runningRank = 0;
    standingsFlatSorted.forEach(function (standing, i, orig) {
        if (i !== 0) { // we can't compare the first player with a previous one
            const prevPlayer = orig[i - 1];
            if (!areScoresEqual(standing, prevPlayer)) {
                runningRank += 1;
            }
        }
        if (!standingsTree[runningRank]) {
            standingsTree[runningRank] = [];
        }
        standingsTree[runningRank].push(standing);
    });
    return [standingsTree, tieBreaks.map((m) => m.name)];
}

/**
 * @type {ScoreCalculator}
 * @returns {typeof WHITE | typeof BLACK?}
 */
function dueColor(playerId, roundList, roundId = null) {
    if (!roundList[roundId - 1]) {
        return null;
    }
    const prevColor = playerMatchColor(
        playerId,
        roundList[roundId - 1]
    );
    return switchColor(prevColor);
}

/**
 * @param {number} playerId
 * @param {Match[][]} roundList
 * @param {number} roundId
 * @param {Player[]} playerList
 * @param {number[][]} avoidList
 * @returns {PlayerData}
 */
export function genPlayerData(
    playerId,
    playerList,
    avoidList,
    roundList,
    roundId
) {
    const player = getPlayerById(playerList, playerId);
    return {
        profile: player,
        rating: player.rating,
        id: playerId,
        score: playerScore(playerId, roundList, roundId),
        dueColor: dueColor(playerId, roundList, roundId),
        colorBalance: playerColorBalance(playerId, roundList, roundId),
        opponentHistory: getPlayersByOpponent(playerId, roundList, roundId),
        upperHalf: false,
        avoidList: getPlayerAvoidList(playerId, avoidList),
        hasHadBye: hasHadBye(playerId, roundList, roundId)
    };
}

/**
 * @type {ScoreCalculator}
 * @returns {Object} {opponentId: result}
 */
export function getResultsByOpponent(playerId, roundList, roundId = null) {
    const matches = getMatchesByPlayer(playerId, roundList, roundId);
    return matches.reduce(
        function (acc, match) {
            const opponent = match.players.filter((id) => id !== playerId)[0];
            const color = match.players.indexOf(playerId);
            return assoc(String(opponent), match.result[color], acc);
        },
        {}
    );
}
