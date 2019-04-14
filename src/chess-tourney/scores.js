// @ts-check
import {firstBy} from "thenby";
/**
 * @typedef {import("./player").Player} Player
 * @typedef {import("./tournament").Tournament} Tournament
 */
/**
 * @typedef {function(Tournament, Player, number=, boolean=): number} ScoreCalculator
 */
/**
 * Get a list of all of a player's scores from each match.
 * @param {Tournament} tourney
 * @param {Player} player
 * @param {number=} roundId
 * @returns {number[]} the list of scores
 */
function playerScoreList(tourney, player, roundId = null) {
    return tourney.getMatchesByPlayer(player, roundId).map(
        (match) => match.result[match.roster.indexOf(player)]
    );
}

/**
 * TODO: Maybe merge this with the other function?
 * @param {Tournament} tourney
 * @param {Player} player
 * @param {number=} roundId
 */
function playerScoreListNoByes(tourney, player, roundId = null) {
    return tourney.getMatchesByPlayer(
        player,
        roundId
    ).filter(
        (match) => !match.isBye()
    ).map(
        (match) => match.result[match.roster.indexOf(player)]
    );
}

/**
 * Get the total score of a player after a given round.
 * @type {ScoreCalculator}
 */
function playerScore(tourney, player, roundId = null) {
    let score = 0;
    let scoreList = playerScoreList(tourney, player, roundId);
    if (scoreList.length > 0) {
        score = scoreList.reduce((a, b) => a + b);
    }
    return score;
}

/**
 * Get the cumulative score of a player
 * @type {ScoreCalculator}
 */
function playerScoreCum(tourney, player, roundId = null) {
    let runningScore = 0;
    /**
     * @type {number[]}
     */
    let cumScores = [];
    let scores = playerScoreListNoByes(tourney, player, roundId);
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
 * Calculate a player's color balance
 * @type {ScoreCalculator}
 * @returns {number} A negative number means they played as white more. A
 * positive number means they played as black more.
 */
function playerColorBalance(tourney, player, roundId = null) {
    let color = 0;
    tourney.getMatchesByPlayer(player, roundId).filter(
        (match) => !match.isBye()
    ).forEach(
        function (match) {
            if (match.roster[0] === player) {
                color += -1;
            } else if (match.roster[1] === player) {
                color += 1;
            }
        }
    );
    return color;
}

/**
 * Gets the modified median factor defined in USCF § 34E1
 * @type {ScoreCalculator}
 */
function modifiedMedian(tourney, player, roundId = null, solkoff = false) {
    // get all of the opponent's scores
    let scores = tourney.getPlayersByOpponent(
        player,
        roundId
    ).filter(
        (opponent) => !opponent.dummy
    ).map(
        (opponent) => playerScore(tourney, opponent, roundId)
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
 * @type {ScoreCalculator}
 */
function solkoff(tourney, player, roundId = null) {
    return modifiedMedian(tourney, player, roundId, true);
}

/**
 * Get the cumulative scores of a player's opponents.
 * @type {ScoreCalculator}
 */
function playerOppScoreCum(tourney, player, roundId = null) {
    const opponents = tourney.getPlayersByOpponent(
        player,
        roundId
    ).filter(
        (opponent) => !opponent.dummy
    );
    let oppScores = opponents.map((p) => playerScoreCum(tourney, p, roundId));
    let score = 0;
    if (oppScores.length !== 0) {
        score = oppScores.reduce((a, b) => a + b);
    }
    return score;
}

/**
 * @type {Object<string, ScoreCalculator>}
 */
const tbFuncs = {
    modifiedMedian,
    playerColorBalance,
    playerOppScoreCum,
    playerScoreCum,
    solkoff
};

/**
 * @typedef {Object} Standing
 * @property {Player} player
 * @property {number} id
 * @property {Object<string, number>} scores
 */

/**
 * @param {Standing} standing1
 * @param {Standing} standing2
 * @returns {boolean}
 */
function areScoresEqual(standing1, standing2) {
    const scoreTypes = Object.getOwnPropertyNames(standing1);
    let areEqual = true;
    scoreTypes.forEach(function (score) {
        if (standing1.scores[score] !== standing2.scores[score]) {
            areEqual = false;
        }
    });
    return areEqual;
}

/**
 * Sort the standings by score, see USCF tie-break rules from § 34.
 * @param {Tournament} tourney
 * @param {number | null} roundId
 * @returns {Array<Array<Standing>>}
 */
function calcStandings(tourney, roundId = null) {
    const tieBreaks = tourney.tieBreak.filter((m) => m.active);
    // Get a flat list of all of the players and their scores.
    const standingsFlat = tourney.players.roster.map(function (player) {
        /**
         * @type {Standing}
         */
        let standing = {
            player: player,
            id: player.id,
            scores: {
                score: playerScore(tourney, player, roundId)
            }
        };
        tieBreaks.forEach(function (method) {
            standing.scores[method.name] = tbFuncs[method.funcName](
                tourney, player, roundId
            );
        });
        return standing;
    });
    // Create a function to sort the players
    let sortFunc = firstBy((player) => player.scores.score, -1);
    // For each tiebreak method, chain another `thenBy` to the function.
    tieBreaks.forEach(function (method) {
        sortFunc = sortFunc.thenBy(
            (player) => player.scores[method.funcName],
            -1
        );
    });
    // Finally, sort the players.
    standingsFlat.sort(sortFunc);
    /**
     * @type {Array<Array<Standing>>}
     */
    const standingsTree = [];
    let runningRank = 0;
    standingsFlat.forEach(function (standing, i, sf) {
        if (i !== 0) { // we can't compare the first player with a previous one
            const prevPlayer = sf[i - 1];
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