import {DUMMYPLAYER} from "./player";

/**
 * Update the ratings for a match based on their ratings when the match began
 * and the match result. See the `elo-rank` NPM package for more information.
 * @param {object} match The `match` object.
 * @returns {object} The `match` object.
 */
function calcRatings(match) {
    let whiteElo = match.players[0].eloRank(match.tourney);
    let blackElo = match.players[1].eloRank(match.tourney);
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
 * Create an object representing a match in a tournament.
 * @param {object} round The round containing the match.
 * @param {object} black The `player` object for white.
 * @param {object} white The `player` object for black.
 */
function createMatch(round, white, black) {
    const match = {
        /**
         * @property {object} round A link to the round containing this match.
         */
        round: round,
        /**
         * @property {object} tourney a link to the tournemnt containing this
         * match.
         */
        tourney: round.tourney,
        /**
         * @property {string} warnings Any warnings about the match, e.g. if
         * there was a pairing error.
         */
        warnings: "",
        /**
         * @property {array} players The pair of `Player` objects. White is at
         * index `0` and black is at index `1`.
         */
        players: [white, black],
        /**
         * @property {array} result the scores for the match. A loss is `0`, a
         * win is `1`, and a draw is `0.5`. White is at index `0` and black is
         * at index `1`.
         */
        result: [0, 0],
        /**
         * @property {array} origRating the cached ratings from when the match
         * began. White is at index `0` and black is at index `1`.
         */
        origRating: [white.rating, black.rating],
        /**
         * @property {array} newRating the updated ratings after the match ends.
         * White is at index `0` and black is at index `1`.
         */
        newRating: [white.rating, black.rating],
        /**
         * @property {number} ideal How ideal this matchup was, based on the
         * maximum matching algorithm.
         */
        ideal: 0,
        /**
         * Switch white and black.
         * @returns {object} This `match` object.
         */
        reverse() {
            match.players.reverse();
            match.result.reverse();
            match.origRating.reverse();
            match.newRating.reverse();
            return match;
        },
        /**
         * Set black as the winner and updates ratings.
         * @returns {object} This `match` object.
         */
        blackWon() {
            match.result = [0, 1];
            calcRatings(match);
            return match;
        },
        /**
         * Set white as the winner and updates ratings.
         * @returns {object} This `match` object.
         */
        whiteWon() {
            match.result = [1, 0];
            calcRatings(match);
            return match;
        },
        /**
         * Set the result as a draw and updates ratings.
         * @returns {object} This `match` object.
         */
        draw() {
            match.result = [0.5, 0.5];
            calcRatings(match);
            return match;
        },
        /**
         * Resets the score and the rating updates.
         * @returns {object} This `match` object.
         */
        resetResult() {
            match.result = [0, 0];
            match.newRating = [...match.origRating];
            match.players[0].rating = match.newRating[0];
            match.players[1].rating = match.newRating[1];
            return match;
        },
        /**
         * Get whether or not the match is over.
         * @returns {bool} `True` if complete, `false` if incomplete.
         */
        isComplete() {
            return match.result[0] + match.result[1] !== 0;
        },
        /**
         * Get whether this is a bye match.
         * @returns {bool} `True` if it's a bye match, `false` if not.
         */
        isBye() {
            return match.players.includes(DUMMYPLAYER);
        },
        /**
         * Get all of the match data for a specific player color.
         * @param {number} color `0` for white and `1` for black.
         * @returns {object} A container for data: the `player` object,
         * `result`, `origRating`, and `newRating`.
         */
        getColorInfo(color) {
            return {
                player: match.players[color],
                result: match.result[color],
                origRating: match.origRating[color],
                newRating: match.newRating[color]
            };
        },
        /**
         * Get the color ID of a player.
         * @param {object} player A `player` object.
         * @returns {number} `0` for white, `1` for black, and `-1` if the
         * player isn't found in the match.
         */
        getPlayerColor(player) {
            return match.players.indexOf(player);
        },
        /**
         * A shortcut for using `match.getPlayerColor()` and
         * `match.getColorInfo()` together.
         * @param {object} player A `player` object.
         * @returns {object} See `matchGetPlayerColor()`.
         */
        getPlayerInfo(player) {
            return match.getColorInfo(match.getPlayerColor(player));
        },
        /**
         * A shortcut for `match.getColorInfo()` for white.
         * @returns {object} See `match.getColorInfo()`
         */
        getWhite() {
            return match.getColorInfo(0);
        },
        /**
         * A shortcut for `match.getColorInfo()` for black.
         * @returns {object} See `match.getColorInfo()`
         */
        getBlack() {
            return match.getColorInfo(1);
        }
    };
    // set bye rounds
    if (match.players[0] === DUMMYPLAYER) {
        match.result = [0, 1];
    } else if (match.players[1] === DUMMYPLAYER) {
        match.result = [1, 0];
    }
    return match;
}

export default Object.freeze(createMatch);
