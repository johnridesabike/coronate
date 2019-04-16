// @ts-check
/**
 * @typedef {import("./player").Player} Player
 * @typedef {import("./round").Round} Round
 * @typedef {import("./tournament").Tournament} Tournament
 */
/**
 * @typedef {Object} Match
 * @property {string} id
 * @property {Round} ref_round
 * @property {Tournament} ref_tourney
 * @property {string} warnings
 * @property {number[]} roster
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
 * @property {(id: number) => PlayerInfo} getColorInfo
 * @property {(id: number) => number} getPlayerColor
 * @property {(id: number) => PlayerInfo} getPlayerInfo
 * @property {function(): PlayerInfo} getWhiteInfo
 * @property {function(): PlayerInfo} getBlackInfo
 */

/**
 * @typedef {Object} PlayerInfo
 * @property {Player} player
 * @property {number} result
 * @property {number} origRating
 * @property {number} newRating
 * @property {number | string} [colorBalance]
 * @property {number} [score]
 * @property {Player[]} [oppList]
 */

/**
 *
 * @param {Match} match
 */
function calcRatings(match) {
    const tourney = match.ref_tourney;
    const white = tourney.players.getPlayerById(match.roster[0]);
    const black = tourney.players.getPlayerById(match.roster[1]);
    let whiteElo = white.getEloRank();
    let blackElo = black.getEloRank();
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
    white.rating = match.newRating[0];
    black.rating = match.newRating[1];
    return match;
}

/**
 * Create a match object.
 * @param {Object} importObj
 * @param {string} [importObj.id]
 * @param {Round} importObj.ref_round
 * @param {number[]} importObj.roster
 * @param {string} [importObj.warnings]
 * @param {number[]} [importObj.result]
 * @param {number[]} [importObj.origRating]
 * @param {number[]} [importObj.newRating]
 * @param {number} [importObj.ideal]
 * @returns {Match}
 */
function createMatch(importObj) {
    const tourney = importObj.ref_round.ref_tourney;
    const getPlayer = tourney.players.getPlayerById;
    const white = getPlayer(importObj.roster[0]);
    const black = getPlayer(importObj.roster[1]);
    /** @type {Match} */
    const match = {
        id: importObj.id || white.id + "." + black.id,
        ref_round: importObj.ref_round,
        ref_tourney: importObj.ref_round.ref_tourney,
        warnings: importObj.warnings || "",
        roster: importObj.roster,
        result: importObj.result || [0, 0],
        origRating: importObj.origRating || [white.rating, black.rating],
        newRating: importObj.newRating || [white.rating, black.rating],
        ideal: importObj.ideal || 0,
        reverse() {
            match.roster.reverse();
            match.result.reverse();
            match.origRating.reverse();
            match.newRating.reverse();
            return match;
        },
        blackWon() {
            match.result = [0, 1];
            calcRatings(match);
            return match;
        },
        whiteWon() {
            match.result = [1, 0];
            calcRatings(match);
            return match;
        },
        draw() {
            match.result = [0.5, 0.5];
            calcRatings(match);
            return match;
        },
        setResult(result) {
            if (result !== match.result) {
                match.result = result;
                if (result[0] + result[1] === 0) {
                    match.resetResult();
                } else {
                    calcRatings(match);
                }
            }
            return match;
        },
        resetResult() {
            match.result = [0, 0];
            match.newRating = [...match.origRating];
            getPlayer(match.roster[0]).rating = match.newRating[0];
            getPlayer(match.roster[1]).rating = match.newRating[1];
            return match;
        },
        isComplete() {
            return match.result[0] + match.result[1] !== 0;
        },
        isBye() {
            let dummies = match.roster.map((p) => getPlayer(p).dummy);
            return dummies.includes(true);
        },
        getColorInfo(color) {
            return {
                player: getPlayer(match.roster[color]),
                result: match.result[color],
                origRating: match.origRating[color],
                newRating: match.newRating[color]
            };
        },
        getPlayerColor(id) {
            return match.roster.indexOf(id);
        },
        getPlayerInfo(id) {
            return match.getColorInfo(match.getPlayerColor(id));
        },
        getWhiteInfo() {
            return match.getColorInfo(0);
        },
        getBlackInfo() {
            return match.getColorInfo(1);
        }
    };
    // match.roster = match.roster.map(function (player) {
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
    if (getPlayer(match.roster[0]).dummy) {
        match.result = [0, tourney.byeValue];
    } else if (getPlayer(match.roster[1]).dummy) {
        match.result = [tourney.byeValue, 0];
    }
    match.roster.forEach(function (id) {
        // This is stored statically so it's available even if data on past
        // matches isn't. Be sure to safely decrement it when deleting match
        // history.
        const player = getPlayer(id);
        if (!player.dummy && !Object.isFrozen(player)) {
            player.matchCount += 1;
        }
    });
    return match;
}

export default Object.freeze(createMatch);
