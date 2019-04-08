import {firstBy} from "thenby";
import config from "./config";
import {dummyPlayer} from "./player";
/**
 * Get a list of all of a player's scores from each match.
 * @param {Player} player
 * @returns {array} the list of scores
 */
function playerScoreList(tourney, player, roundId = null) {
    return tourney.getMatchesByPlayer(player, roundId).map(
        (match) => match.result[match.players.indexOf(player)]
    );
}

// Maybe merge this with the other function?
function playerScoreListNoByes(tourney, player, roundId = null) {
    return tourney.getMatchesByPlayer(
        player,
        roundId
    ).filter(
        (match) => !match.isBye()
    ).map(
        (match) => match.result[match.players.indexOf(player)]
    );
}

/**
 * Get the total score of a player after a given round.
 * @param {Player} player
 * @param {number} roundId
 */
function playerScore(tourney, player, roundId = null) {
    var score = 0;
    var scoreList = playerScoreList(tourney, player, roundId);
    if (scoreList.length > 0) {
        score = scoreList.reduce((a, b) => a + b);
    }
    return score;
}

/**
 * Get the cumulative score of a player
 * @param {Player} player
 * @param {number} roundId
 */
function playerScoreCum(tourney, player, roundId = null) {
    var runningScore = 0;
    var cumScores = [];
    var scores = playerScoreListNoByes(tourney, player, roundId);
    scores.forEach(function (score) {
        runningScore += score;
        cumScores.push(runningScore);
    });
    var totalScore = 0;
    if (cumScores.length !== 0) {
        totalScore = cumScores.reduce((a, b) => a + b);
    }
    return totalScore;
}

/**
 * Calculate a player's color balance
 * @param {Player} player
 * @param {Int}    round The ID of the highest round to consider
 * @returns {Int} A negative number means they played as black more. A positive
 * number means they played as white more.
 */
function playerColorBalance(tourney, player, roundId = null) {
    var color = 0;
    tourney.getMatchesByPlayer(player, roundId).filter(
        (match) => !match.isBye()
    ).forEach(
        function (match) {
            if (match.players[0] === player) {
                color += 1;
            } else if (match.players[1] === player) {
                color += -1;
            }
        }
    );
    return color;
}

/**
 * Gets the modified median factor defined in USCF § 34E1
 * @param {Player} player
 * @param {number} roundId
 */
function modifiedMedian(tourney, player, roundId = null, solkoff = false) {
    // get all of the opponent's scores
    var scores = tourney.getPlayersByOpponent(
        player,
        roundId
    ).filter(
        (opponent) => opponent !== dummyPlayer
    ).map(
        (opponent) => playerScore(tourney, opponent, roundId)
    );
    //sort them, then remove the first and last items
    scores.sort();
    if (!solkoff) {
        scores.pop();
        scores.shift();
    }
    var finalScore = 0;
    if (scores.length > 0) {
        finalScore = scores.reduce((a, b) => a + b);
    }
    return finalScore;
}

/**
 * A shortcut for passing the `solkoff` variable to `modifiedMedian`.
 * @param {Player} player
 * @param {number} roundId
 */
function solkoff(tourney, player, roundId = null) {
    return modifiedMedian(tourney, player, roundId, true);
}

function playerOppScoreCum(tourney, player, roundId = null) {
    const opponents = tourney.getPlayersByOpponent(
        player,
        roundId
    ).filter(
        (opponent) => opponent !== dummyPlayer
    );
    var oppScores = opponents.map((p) => playerScoreCum(tourney, p, roundId));
    var score = 0;
    if (oppScores.length !== 0) {
        score = oppScores.reduce((a, b) => a + b);
    }
    return score;
}

function areScoresEqual(player1, player2) {
    const scoreTypes = Object.getOwnPropertyNames(player1);
    var areEqual = true;
    scoreTypes.forEach(function (score) {
        if (score !== "player" && player1[score] !== player2[score]) {
            areEqual = false;
        }
    });
    return areEqual;
}

/**
 * Sort the standings by score, see USCF tie-break rules from § 34.
 * @param {number} roundId
 * @returns {Array} The sorted list of players
 */
function calcStandings(tourney, roundId = null) {
    const tieBreaks = config.tieBreak.filter((m) => m.active);
    const standingsFlat = tourney.roster.all.map(function (player) {
        var standing = {
            player: player,
            score: playerScore(tourney, player, roundId)
        };
        tieBreaks.forEach(function (method) {
            standing[method.func.name] = method.func(tourney, player, roundId);
        });
        return standing;
    });
    var sortFunc = firstBy((player) => player.score, -1);
    tieBreaks.forEach(function (method) {
        sortFunc = sortFunc.thenBy((player) => player[method.func.name], -1);
    });
    standingsFlat.sort(sortFunc);
    const standingsTree = [];
    var runningRank = 0;
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

/**
 * `scores.tieBreak` is used for to determine the tie-break methods. USCF
 * recommends using these methods in-order: modified median, solkoff,
 * cumulative, and cumulative of opposition.
 * */
const tieBreakMethods = {
    modifiedMedian,
    playerColorBalance,
    playerOppScoreCum,
    playerScoreCum,
    solkoff
};
config.tieBreak.forEach(function (method) {
    // Dumb question... does assigning functions like this harm security?
    method.func = tieBreakMethods[method.funcName];
});

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