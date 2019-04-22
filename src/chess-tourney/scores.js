// @ts-check
import {firstBy} from "thenby";
import {dummyPlayer, getPlayer, getPlayerAvoidList} from "./player";

/**
 * @typedef {import("./index").ScoreCalculator} ScoreCalculator
 * @typedef {import("./index").Match} Match
 */

/**
 *
 * @param {Match} match
 * @returns {boolean}
 */
function isBye(match) {
    return match.players.includes(dummyPlayer.id);
}

/**
 * @param {number} playerId
 * @param {object[]} matchList
 * @returns {number?}
 */
function playerMatchColor(playerId, matchList) {
    /**@type {number} */
    let color = null;
    const match = matchList.filter((m) => m.players.includes(playerId))[0];
    if (match) {
        color = match.players.indexOf(playerId);
    }
    return color;
}
Object.freeze(playerMatchColor);
export {playerMatchColor};

/**
 * @type {ScoreCalculator}
 * @returns {Match[]}
 */
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

/**
 * @type {ScoreCalculator}
 * @returns {boolean}
 */
function hasHadBye(playerId, roundList, roundId = null) {
    return getMatchesByPlayer(
        playerId,
        roundList,
        roundId
    ).reduce(
        (acc, match) => acc.concat(match.players),
        []
    ).includes(dummyPlayer.id);
}
Object.freeze(hasHadBye);
export {hasHadBye};

/**
 * @type {ScoreCalculator}
 * @returns {number[]}
 */
function getPlayersByOpponent(opponentId, roundList, roundId = null) {
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
Object.freeze(getPlayersByOpponent);
export {getPlayersByOpponent};

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
function playerScore(playerId, roundList, roundId = null) {
    let score = 0;
    const scoreList = playerScoreList(playerId, roundList, roundId);
    if (scoreList.length > 0) {
        score = scoreList.reduce((a, b) => a + b);
    }
    return score;
}
Object.freeze(playerScore);
export {playerScore};

/**
 * @type {ScoreCalculator}
 * @returns {number}
 */
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
 * @type {ScoreCalculator}
 * @returns {number}
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
Object.freeze(playerColorBalance);
export {playerColorBalance};

/**
 * Gets the modified median factor defined in USCF § 34E1
 * @type {ScoreCalculator}
 * @param {boolean} [isSolkoff]
 * @returns {number}
 */
function modifiedMedian(pId, roundList, roundId = null, isSolkoff = false) {
    // get all of the opponent's scores
    let scores = getPlayersByOpponent(
        pId,
        roundList,
        roundId
    ).filter(
        (opponent) => opponent !== dummyPlayer.id
    ).map(
        (opponent) => playerScore(opponent, roundList, roundId)
    );
    //sort them, then remove the first and last items
    scores.sort();
    if (!isSolkoff) {
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
 * A shortcut for passing the `isSolkoff` variable to `modifiedMedian`.
 * @type {ScoreCalculator}
 * @returns {number}
 */
function solkoff(playerId, roundList, roundId = null) {
    return modifiedMedian(playerId, roundList, roundId, true);
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
        (opponent) => opponent !== dummyPlayer.id
    );
    let oppScores = opponents.map((p) => playerScoreCum(p, roundList, roundId));
    let score = 0;
    if (oppScores.length !== 0) {
        score = oppScores.reduce((a, b) => a + b);
    }
    return score;
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
 * @typedef {import("./index").Standing} Standing
 */

/**
 * @param {Standing} standing1
 * @param {Standing} standing2
 * @returns {boolean}
 */
function areScoresEqual(standing1, standing2) {
    let areEqual = true;
    // Check if any of them aren't equal
    if (standing1.score !== standing2.score) {
        areEqual = false;
    }
    Object.keys(standing1.tieBreaks).forEach(function (index) {
        if (standing1.tieBreaks[index] !== standing2.tieBreaks[index]) {
            areEqual = false;
        }
    });
    return areEqual;
}

/**
 * @typedef {import("./index").Round} Round
 */

/**
 * @param {Round[]} roundList
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
 * @param {Round[]} roundList
 * @param {number} [roundId]
 * @returns {[Standing[][], string[]]} The standings and the list of method used
 */
function calcStandings(methods, roundList, roundId = null) {
    const tieBreaks = methods.map((m) => tieBreakMethods[m]);
    // Get a flat list of all of the players and their scores.
    const standingsFlat = getAllPlayers(roundList).map(function (pId) {
        /** @type {Standing} */
        const standing = {
            id: pId,
            score: playerScore(pId, roundList, roundId),
            tieBreaks: tieBreaks.map((method) => (
                method.func(pId, roundList, roundId)
            ))
        };
        return standing;
    });
    // Create a function to sort the players
    let sortFunc = firstBy((standing) => standing.score, -1);
    // For each tiebreak method, chain another `thenBy` to the function.
    tieBreaks.forEach(function (ignore, index) {
        sortFunc = sortFunc.thenBy((standing) => standing.tieBreaks[index], -1);
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
    return [standingsTree, tieBreaks.map((m) => m.name)];
}
Object.freeze(calcStandings);
export {calcStandings};

/**
 * TODO: merge this with the pairings one?
 * @type {ScoreCalculator}
 * @returns {Object}
 */
function getPlayerMatchData(playerId, roundList, roundNum = null) {
    return {
        data: (playerList) => getPlayer(playerId, playerList),
        score: () => playerScore(playerId, roundList, roundNum),
        opponents: (playerList) => (
            getPlayersByOpponent(playerId, roundList, roundNum).map(
                (pId) => getPlayer(pId, playerList)
            )
        ),
        colorBalance: () => playerColorBalance(playerId, roundList, roundNum),
        avoidList: (avoidList, playerList) => (
            getPlayerAvoidList(playerId, avoidList).map(
                (pId) => getPlayer(pId, playerList)
            )
        )
    };
}
Object.freeze(getPlayerMatchData);
export {getPlayerMatchData};