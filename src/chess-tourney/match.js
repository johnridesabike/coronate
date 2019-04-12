/**
 * Update the ratings for a match based on their ratings when the match began
 * and the match result. See the `elo-rank` NPM package for more information.
 * @param {object} match The `match` object.
 * @returns {object} The `match` object.
 */
function calcRatings(match) {
    let whiteElo = match.players[0].getEloRank();
    let blackElo = match.players[1].getEloRank();
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
    match.players.forEach(function (player, i) {
        player.rating = match.newRating[i];
    });
    return match;
}

/**
 * Create an object representing a match in a tournament.
 * @param {object} round The round containing the match.
 * @param {object} black The `player` object for white.
 * @param {object} white The `player` object for black.
 */
function createMatch(round, importObj) {
    let tourney = round.ref_tourney;
    let [black, white] = importObj.players;
    // If the players are ID numbers, get their referant objects.
    if (typeof black === "number") {
        black = tourney.roster.getPlayerById(black);
    }
    if (typeof white === "number") {
        white = tourney.roster.getPlayerById(white);
    }
    const match = {
        id: importObj.id || 0,
        /**
         * @property {object} ref_round A reference to the round containing
         * this match.
         */
        ref_round: round,
        /**
         * @property {object} ref_tourney A reference to the tournament
         * containing this match.
         */
        ref_tourney: tourney,
        /**
         * @property {string} warnings Any warnings about the match, e.g. if
         * there was a pairing error.
         */
        warnings: importObj.warnings || "",
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
        result: importObj.result || [0, 0],
        /**
         * @property {array} origRating the cached ratings from when the match
         * began. White is at index `0` and black is at index `1`.
         */
        origRating: importObj.origRating || [white.rating, black.rating],
        /**
         * @property {array} newRating the updated ratings after the match ends.
         * White is at index `0` and black is at index `1`.
         */
        newRating: importObj.newRating || [white.rating, black.rating],
        /**
         * @property {number} ideal How ideal this matchup was, based on the
         * maximum matching algorithm.
         */
        ideal: importObj.ideal || 0,
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
            let dummies = match.players.map((p) => p.dummy);
            return dummies.includes(true);
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
        getWhiteInfo() {
            return match.getColorInfo(0);
        },
        /**
         * A shortcut for `match.getColorInfo()` for black.
         * @returns {object} See `match.getColorInfo()`
         */
        getBlackInfo() {
            return match.getColorInfo(1);
        }
    };
    // set bye rounds
    if (match.players[0].dummy) {
        match.result = [0, tourney.byeValue];
    } else if (match.players[1].dummy) {
        match.result = [tourney.byeValue, 0];
    }
    match.players.forEach(function (player) {
        // This is stored statically so it's available even if data on past
        // matches isn't. Be sure to safely decrement it when deleting match
        // history.
        player.matchCount += 1;
    });
    return match;
}

export default Object.freeze(createMatch);
