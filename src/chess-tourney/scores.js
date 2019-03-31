import {firstBy} from "thenby";

/**
 * Get a list of all of a player's scores from each match.
 * @param {Player} player
 * @returns {array} the list of scores
 */
function playerScoreList(tourney, player, roundId = null) {
    return tourney.playerMatchHistory(player, roundId).map(
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
    var scores = playerScoreList(tourney, player, roundId);
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
    tourney.playerMatchHistory(player, roundId).filter(
        (match) => !match.isBye
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
    var scores = playerOppHistory(tourney, player, roundId).map(
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

/**
 * Generate a list of a player's opponents.
 * @param   {Player} player
 * @returns {Array} A list of past opponents
 */
function playerOppHistory(tourney, player, roundId = null) {
    var opponents = [];
    tourney.playerMatchHistory(player, roundId).forEach(function (match) {
        opponents = opponents.concat(
            match.players.filter(
                (player2) => player2 !== player
            )
        );
    });
    return opponents;
}

function playerOppScoreCum(tourney, player, roundID = null) {
    const opponents = playerOppHistory(tourney, player, roundID);
    var oppScores = opponents.map((p) => playerScoreCum(tourney, p, roundID));
    var score = 0;
    if (oppScores.length !== 0) {
        score = oppScores.reduce((a, b) => a + b);
    }
    return score;
}

/**
 * Sort the standings by score and USCF tie-break rules from § 34. USCF
 * recommends using these methods in-order: modified median, solkoff,
 * cumulative, and cumulative of opposition.
 * @param {number} roundId
 * @returns {Array} The sorted list of players
 */
function calcStandings(tourney, roundId = null) {
    const standingsFlat = tourney.roster.all.map(function (player) {
        return {
            player: player,
            score: playerScore(tourney, player, roundId),
            modifiedMedian: modifiedMedian(tourney, player, roundId),
            solkoff: solkoff(tourney, player, roundId),
            scoreCum: playerScoreCum(tourney, player, roundId),
            oppScoreCum: playerOppScoreCum(tourney, player, roundId)
        };
    });
    standingsFlat.sort(
        firstBy((p) => p.score, -1)
        .thenBy((p) => p.modifiedMedian, -1)
        .thenBy((p) => p.solkoff, -1)
        .thenBy((p) => p.scoreCum, -1)
        .thenBy((p) => p.oppScoreCum, -1)
    );
    const standingsTree = [];
    var runningRank = 0;
    standingsFlat.forEach(function (player, i, sf) {
        if (i !== 0) { // we can't compare the first player with a previous one
            var prevPlayer = sf[i - 1];
            if (!(player.score === prevPlayer.score
                && player.modifiedMedian === prevPlayer.modifiedMedian
                && player.solkoff === prevPlayer.solkoff
                && player.scoreCum === prevPlayer.scoreCum
                && player.oppScoreCum === prevPlayer.oppScoreCum)) {
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

export default Object.freeze(
    {
        calcStandings,
        modifiedMedian,
        playerColorBalance,
        playerOppHistory,
        playerOppScoreCum,
        playerScore,
        playerScoreCum,
        playerScoreList,
        solkoff
    }
);