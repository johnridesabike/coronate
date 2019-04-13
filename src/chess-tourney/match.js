// @ts-check
/**
 * @typedef {import("./player").player} player
 * @typedef {import("./round").round} round
 * @typedef {import("./tournament").tournament} tournament
 */
/**
 * @typedef {Object} match
 * @property {number} id
 * @property {round} ref_round
 * @property {tournament} ref_tourney
 * @property {string} warnings
 * @property {player[]} roster
 * @property {number[]} result A loss is `0`, a win is `1`, and a draw is `0.5`.
 * White is at index `0` and black is at index `1`.
 * @property {number[]} origRating White is at index `0` and black is at
 * index `1`.
 * @property {number[]} newRating White is at index `0` and black is at
 * index `1`.
 * @property {number} ideal
 * @property {function} reverse
 * @property {function} blackWon
 * @property {function} whiteWon
 * @property {function} draw
 * @property {function(number[])} setResult
 * @property {function} resetResult
 * @property {function(): boolean} isComplete
 * @property {function(): boolean} isBye
 * @property {function(number): playerInfo} getColorInfo
 * @property {function(player): number} getPlayerColor
 * @property {function(player): playerInfo} getPlayerInfo
 * @property {function(): playerInfo} getWhiteInfo
 * @property {function(): playerInfo} getBlackInfo
 */

/**
 * @typedef {Object} playerInfo
 * @property {player} player
 * @property {number} result
 * @property {number} origRating
 * @property {number} newRating
 */

/**
 *
 * @param {match} match
 */
function calcRatings(match) {
    let whiteElo = match.roster[0].getEloRank();
    let blackElo = match.roster[1].getEloRank();
    const FLOOR = 100;
    let scoreExpected = [
        whiteElo.getExpected(match.origRating[0], match.origRating[1]),
        blackElo.getExpected(match.origRating[1], match.origRating[0])
    ];
    match.newRating = [
        whiteElo.updateRating(
            scoreExpected[0],
            match.result[0],
            match.origRating[0]
        ),
        blackElo.updateRating(
            scoreExpected[1],
            match.result[1],
            match.origRating[1]
        )
    ];
    match.newRating = match.newRating.map(
        (rating) => (
            (rating < FLOOR)
            ? FLOOR
            : rating
        )
    );
    match.roster.forEach(function (player, i) {
        player.rating = match.newRating[i];
    });
    return match;
}

function createMatch(importObj) {
    let black;
    let white;
    let tourney = importObj.ref_round.ref_tourney;
    // If the players are ID numbers, get their referant objects.
    if (typeof importObj.roster[0] === "number") {
        white = tourney.players.getPlayerById(white);
    } else {
        white = importObj.roster[0];
    }
    if (typeof importObj.roster[1] === "number") {
        black = tourney.players.getPlayerById(black);
    } else {
        black = importObj.roster[1];
    }
    /**
     * @type {match}
     */
    const newMatch = {
        id: importObj.id || 0,
        ref_round: importObj.ref_round,
        ref_tourney: importObj.ref_round.ref_tourney,
        warnings: importObj.warnings || "",
        roster: [white, black],
        result: importObj.result || [0, 0],
        origRating: importObj.origRating || [white.rating, black.rating],
        newRating: importObj.newRating || [white.rating, black.rating],
        ideal: importObj.ideal || 0,
        reverse() {
            newMatch.roster.reverse();
            newMatch.result.reverse();
            newMatch.origRating.reverse();
            newMatch.newRating.reverse();
            return newMatch;
        },
        blackWon() {
            newMatch.result = [0, 1];
            calcRatings(newMatch);
            return newMatch;
        },
        whiteWon() {
            newMatch.result = [1, 0];
            calcRatings(newMatch);
            return newMatch;
        },
        draw() {
            newMatch.result = [0.5, 0.5];
            calcRatings(newMatch);
            return newMatch;
        },
        setResult(result) {
            if (result !== newMatch.result) {
                newMatch.result = result;
                if (result[0] + result[1] === 0) {
                    newMatch.resetResult();
                } else {
                    calcRatings(newMatch);
                }
            }
            return newMatch;
        },
        resetResult() {
            newMatch.result = [0, 0];
            newMatch.newRating = [...newMatch.origRating];
            newMatch.roster[0].rating = newMatch.newRating[0];
            newMatch.roster[1].rating = newMatch.newRating[1];
            return newMatch;
        },
        isComplete() {
            return newMatch.result[0] + newMatch.result[1] !== 0;
        },
        isBye() {
            let dummies = newMatch.roster.map((p) => p.dummy);
            return dummies.includes(true);
        },
        getColorInfo(color) {
            return {
                player: newMatch.roster[color],
                result: newMatch.result[color],
                origRating: newMatch.origRating[color],
                newRating: newMatch.newRating[color]
            };
        },
        getPlayerColor(player) {
            return newMatch.roster.indexOf(player);
        },
        getPlayerInfo(player) {
            return newMatch.getColorInfo(newMatch.getPlayerColor(player));
        },
        getWhiteInfo() {
            return newMatch.getColorInfo(0);
        },
        getBlackInfo() {
            return newMatch.getColorInfo(1);
        }
    };
    // newMatch.roster = newMatch.roster.map(function (player) {
    //     if (typeof player === "number") {
    //         if (player === -1) {
    //             return dummyPlayer;
    //         } else {
    //             return tourney.players.getPlayerById(player);
    //         }
    //     } else {
    //         return player;
    //     }
    // });
    // set bye rounds
    if (newMatch.roster[0].dummy) {
        newMatch.result = [0, tourney.byeValue];
    } else if (newMatch.roster[1].dummy) {
        newMatch.result = [tourney.byeValue, 0];
    }
    newMatch.roster.forEach(function (player) {
        // This is stored statically so it's available even if data on past
        // matches isn't. Be sure to safely decrement it when deleting match
        // history.
        if (!player.dummy && !Object.isFrozen(player)) {
            player.matchCount += 1;
        }
    });
    return newMatch;
}

export default Object.freeze(createMatch);
