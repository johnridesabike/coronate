// @ts-check
import {firstBy} from "thenby";
/**
 * @typedef {import("./player").player} player
 * @typedef {import("./tournament").tournament} tournament
 */
 /**
  * @typedef {Object} standing
  * @property {player} player
  * @property {number} score
  * @property {number} [modifiedMedian]
  * @property {number} [playerColorBalance]
  * @property {number} [playerOppScoreCum]
  * @property {number} [playerScoreCum]
  * @property {number} [solkoff]
  */
/**
 * Get a list of all of a player's scores from each match.
 * @param {tournament} tourney
 * @param {player} player
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
 * @param {tournament} tourney
 * @param {player} player
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
 * @param {tournament} tourney
 * @param {player} player
 * @param {number=} roundId
 * @returns {number}
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
 * @param {tournament} tourney
 * @param {player} player
 * @param {number=} roundId
 * @returns {number}
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
 * @param {tournament} tourney
 * @param {player} player
 * @param {number=} roundId
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
 * @param {tournament} tourney
 * @param {player} player
 * @param {number=} roundId
 * @param {boolean=} solkoff
 * @returns {number}
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
 * @param {tournament} tourney
 * @param {player} player
 * @param {number=} roundId
 * @returns {number}
 */
function solkoff(tourney, player, roundId = null) {
    return modifiedMedian(tourney, player, roundId, true);
}

/**
 * Get the cumulative scores of a player's opponents.
 * @param {tournament} tourney
 * @param {player} player
 * @param {number=} roundId
 * @returns {number}
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
 * @param {Object} player1
 * @param {Object} player2
 * @returns {boolean}
 */
function areScoresEqual(player1, player2) {
    const scoreTypes = Object.getOwnPropertyNames(player1);
    let areEqual = true;
    scoreTypes.forEach(function (score) {
        if (score !== "player" && player1[score] !== player2[score]) {
            areEqual = false;
        }
    });
    return areEqual;
}

/**
 *
 * @param {string} funcName
 * @returns {function}
 */
function getTbFunc(funcName) {
    /**
     * @type {Object.<string, function>}
     */
    const tieBreakMethods = {
        modifiedMedian,
        playerColorBalance,
        playerOppScoreCum,
        playerScoreCum,
        solkoff
    };
    return tieBreakMethods[funcName];
}

/**
 * Sort the standings by score, see USCF tie-break rules from § 34.
 * @param {tournament} tourney
 * @param {number=} roundId
 * @returns {Array<Array<standing>>}
 */
function calcStandings(tourney, roundId = null) {
    const tieBreaks = tourney.tieBreak.filter((m) => m.active);
    const standingsFlat = tourney.players.roster.map(function (player) {
        /**
         * @type {standing}
         */
        let newStand = {
            player: player,
            score: playerScore(tourney, player, roundId)
        };
        tieBreaks.forEach(function (method) {
            newStand[method.name] = getTbFunc(
                method.funcName
            )(tourney, player, roundId);
        });
        return newStand;
    });
    let sortFunc = firstBy((player) => player.score, -1);
    tieBreaks.forEach(function (method) {
        sortFunc = sortFunc.thenBy((player) => player[method.funcName], -1);
    });
    standingsFlat.sort(sortFunc);
    /**
     * @type {Array<Array<standing>>}
     */
    const standingsTree = [];
    let runningRank = 0;
    standingsFlat.forEach(function (player, i, sf) {
        if (i !== 0) { // we can't compare the first player with a previous one
            const prevPlayer = sf[i - 1];
            if (!areScoresEqual(player, prevPlayer)) {
                runningRank += 1;
            }
        }
        if (!standingsTree[runningRank]) {
            standingsTree[runningRank] = [];
        }
        standingsTree[runningRank].push(player);
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