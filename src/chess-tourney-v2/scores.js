// @ts-check
import {firstBy} from "thenby";
import {dummyPlayer} from "./player";
import demoTieBreaks from "../demo-tiebreak.json";

function isBye(match) {
    return match.result.includes(dummyPlayer.id);
}

function getMatchesByPlayer(playerId, roundList, roundId = null) {
    let rounds;
    if (roundId === null) {
        rounds = roundList;
    } else {
        rounds = roundList.slice(0, roundId + 1);
    }
    return rounds.reduce( // flatten the rounds to just the matches
        (acc, round) => acc.concat(round),
        []
    ).filter(
        (match) => match.players.includes(playerId)
    );
}

function getPlayersByOpponent(opponent, roundList, roundId = null) {
    return getMatchesByPlayer(
        opponent,
        roundList,
        roundId
    ).reduce(
        (acc, match) => acc.concat(match.players),
        []
    ).filter(
        (player) => player !== opponent
    );
}

/**
 * Get a list of all of a player's scores from each match.
 * @param {number} player
 * @param {[]} roundList
 * @param {number=} roundId
 * @returns {number[]} the list of scores
 */
function playerScoreList(player, roundList, roundId = null) {
    return getMatchesByPlayer(player, roundList, roundId).map(
        (match) => match.result[match.players.indexOf(player)]
    );
}

/**
 * TODO: Maybe merge this with the other function?
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

function playerScore(playerId, roundList, roundId = null) {
    let score = 0;
    const scoreList = playerScoreList(playerId, roundList, roundId);
    if (scoreList.length > 0) {
        score = scoreList.reduce((a, b) => a + b);
    }
    return score;
}

function playerScoreCum(playerId, roundList, roundId = null) {
    let runningScore = 0;
    /** @type {number[]} */
    let cumScores = [];
    let scores = playerScoreListNoByes(playerId, roundList, roundId);
    scores.forEach(function (score) {
        runningScore += score;
        cumScores.push(runningScore);
    });
    let totalScore = 0;
    if (cumScores.length !== 0) {
        totalScore = cumScores.reduce((a, b) => a + b);
    }
    return totalScore;
}

/**
 * Calculate a player's color balance. A negative number means they played as
 * white more. A positive number means they played as black more.
 */
function playerColorBalance(playerId, roundList, roundId = null) {
    let color = 0;
    getMatchesByPlayer(playerId, roundList, roundId).filter(
        (match) => !isBye(match)
    ).forEach(
        function (match) {
            if (match.players[0] === playerId) {
                color += -1;
            } else if (match.players[1] === playerId) {
                color += 1;
            }
        }
    );
    return color;
}

/**
 * Gets the modified median factor defined in USCF § 34E1
 */
function modifiedMedian(playerId, roundList, roundId = null, solkoff = false) {
    // get all of the opponent's scores
    let scores = getPlayersByOpponent(
        playerId,
        roundList,
        roundId
    ).filter(
        (opponent) => opponent !== dummyPlayer.id
    ).map(
        (opponent) => playerScore(opponent, roundList, roundId)
    );
    //sort them, then remove the first and last items
    scores.sort();
    if (!solkoff) {
        scores.pop();
        scores.shift();
    }
    let finalScore = 0;
    if (scores.length > 0) {
        finalScore = scores.reduce((a, b) => a + b);
    }
    return finalScore;
}

/**
 * A shortcut for passing the `solkoff` variable to `modifiedMedian`.
 */
function solkoff(playerId, roundList, roundId = null) {
    return modifiedMedian(playerId, roundList, roundId, true);
}

/**
 * Get the cumulative scores of a player's opponents.
 */
function playerOppScoreCum(playerId, roundList, roundId = null) {
    const opponents = getPlayersByOpponent(
        playerId,
        roundList,
        roundId
    ).filter(
        (opponent) => opponent !== dummyPlayer.id
    );
    let oppScores = opponents.map((p) => playerScoreCum(p, roundList, roundId));
    let score = 0;
    if (oppScores.length !== 0) {
        score = oppScores.reduce((a, b) => a + b);
    }
    return score;
}

const tbFuncs = {
    modifiedMedian,
    playerColorBalance,
    playerOppScoreCum,
    playerScoreCum,
    solkoff
};

/**
 * @typedef {Object} Standing
 * @property {number} id
 * @property {Object<string, number>} scores
 */

/**
 * @param {Standing} standing1
 * @param {Standing} standing2
 * @returns {boolean}
 */
function areScoresEqual(standing1, standing2) {
    // Get the list of tiebreak types
    const scoreTypes = Object.getOwnPropertyNames(standing1.scores);
    let areEqual = true;
    // Check if any of them aren't equal
    scoreTypes.forEach(function (score) {
        if (standing1.scores[score] !== standing2.scores[score]) {
            areEqual = false;
        }
    });
    return areEqual;
}

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
 * @returns {Array<Array<Standing>>}
 */
function calcStandings(roundList, roundId = null) {
    const tieBreaks = demoTieBreaks.filter((m) => m.active);
    // Get a flat list of all of the players and their scores.
    const standingsFlat = getAllPlayers(roundList).map(function (pId) {
        /** @type {Standing} */
        const standing = {
            id: pId,
            scores: {
                score: playerScore(pId, roundList, roundId)
            }
        };
        tieBreaks.forEach(function (method) {
            standing.scores[method.id] = tbFuncs[method.id](
                pId,
                roundList,
                roundId
            );
        });
        return standing;
    });
    // Create a function to sort the players
    let sortFunc = firstBy((standing) => standing.scores.score, -1);
    // For each tiebreak method, chain another `thenBy` to the function.
    tieBreaks.forEach(function (method) {
        sortFunc = sortFunc.thenBy(
            (standing) => standing.scores[method.id],
            -1
        );
    });
    // Finally, sort the players.
    standingsFlat.sort(sortFunc);
    /** @type {Standing[][]} */
    const standingsTree = [];
    let runningRank = 0;
    standingsFlat.forEach(function (standing, i, orig) {
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
    return standingsTree;
}

export default Object.freeze({
    calcStandings,
    modifiedMedian,
    playerColorBalance,
    playerOppScoreCum,
    playerScore,
    playerScoreCum,
    playerScoreList,
    solkoff
});