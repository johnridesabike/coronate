import {DUMMYPLAYER} from "./player";

function calcRatings(match) {
    let whiteElo = match.players[0].eloRank(match);
    let blackElo = match.players[1].eloRank(match);
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
    match.players[0].rating = match.newRating[0];
    match.players[1].rating = match.newRating[1];
    return match;
}

/**
 * Represents a match in a tournament.
 *
 * @param {Player} black
 * @param {Player} white
 */
function createMatch(round, white, black) {
    const match = {
        round: round,
        players: [white, black],
        result: [0, 0],
        // cache the ratings from when the match began
        origRating: [white.rating, black.rating],
        // the newly calculated ratings after the match ends
        newRating: [white.rating, black.rating],
        /**
         * Sets black as the winner.
         */
        blackWon() {
            match.result = [0, 1];
            calcRatings(match);
            return match;
        },
        /**
         * Sets white as the winner.
         */
        whiteWon() {
            match.result = [1, 0];
            calcRatings(match);
            return match;
        },
        /**
         * Sets result as a draw.
         */
        draw() {
            match.result = [0.5, 0.5];
            calcRatings(match);
            return match;
        },
        resetResult() {
            match.result = [0, 0];
            match.newRating = [].concat(match.origRating);
            return match;
        },
        isComplete() {
            return match.result[0] + match.result[1] !== 0;
        },
        isBye() {
            return match.players.includes(DUMMYPLAYER);
        },
        getColorInfo(color) {
            return {
                player: match.players[color],
                result: match.result[color],
                origRating: match.origRating[color],
                newRating: match.newRating[color]
            };
        },
        getPlayerColor(player) {
            return match.players.indexOf(player);
        },
        getPlayerInfo(player) {
            return match.getColorInfo(match.getPlayerColor(player));
        },
        getWhite() {
            return match.getColorInfo(0);
        },
        getBlack() {
            return match.getColorInfo(1);
        }
    };
    // set bye rounds
    const dummies = match.players.map((p) => p.dummy);
    if (dummies[0]) {
        match.result = [0, 1];
    } else if (dummies[1]) {
        match.result = [1, 0];
    }
    return match;
}

export default Object.freeze(createMatch);
