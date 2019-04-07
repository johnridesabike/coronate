import EloRank from "elo-rank";

/**
 * Represents an indivudal player. Call it with `createPlayer("John", ...)` or
 * `createPlayer({firstName: "John", ...})`. The latter is convenient for
 * converting JSON objects.
 * @param {object} firstName Either the person's first name or an object
 * containing all the parameters.
 * @param {string} lastName  The person's last name.
 * @param {int}    rating    The person's Elo rating.
 */
function createPlayer(firstName, lastName = "", rating = 1200) {
    const player = {
        /**
         * @property {string} firstName The person's first name.
         */
        firstName: "",
        /**
         * @property {string} lastName The person's last name.
         */
        lastName: "",
        /**
         * @property {number} rating The person's Elo rating.
         */
        rating: 0,
        /**
         * @property {bool} dummy If true, this person won't count in certain
         * scorings.
         */
        dummy: false,
        /**
         * @property {number} Ne Number of games the rating is based on.
         */
        Ne: 0,
        /**
         * Create an Elo calculator with an updated K-factor. See the `elo-rank`
         * NPM package for more information.
         * @param {object} tourney The current tournament.
         * @returns {object} An `EloRank` object.
         */
        eloRank(tourney) {
            const m = tourney.getMatchesByPlayer(player).length;
            const K = 800 / (player.Ne + m);
            return new EloRank(K);
        },
        /**
         * Get if a player has had a bye round.
         * @param {object} tourney The current tournament.
         * @returns {bool} True if the player has had a bye round, false if not.
         */
        hasHadBye(tourney) {
            return tourney.getPlayersByOpponent(player).includes(dummyPlayer);
        }
    };
    if (typeof firstName === "object") {
        Object.assign(player, firstName);
    } else {
        player.firstName = firstName;
        player.lastName = lastName;
        player.rating = rating;
    }
    return player;
}

/**
 * A stand-in for bye matches.
 * @constant {Player} dummyPlayer
 */
const dummyPlayer = Object.freeze(
    createPlayer(
        {
            firstName: "Bye",
            dummy: true,
            rating: 0
        }
    )
);

export {dummyPlayer, createPlayer};
