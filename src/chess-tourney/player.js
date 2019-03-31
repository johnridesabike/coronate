import EloRank from "elo-rank";

/**
 * Represents an indivudal player. Call it with `createPlayer("John", ...)` or
 * `createPlayer({firstName: "John", ...})`. The latter is convenient for
 * converting JSON objects.
 * @param {string or object} firstName
 * @param {string} lastName
 * @param {int}        rating
 */
function createPlayer(firstName, lastName = "", rating = 1200) {
    const player = {
        dummy: false,
        Ne: 0, // number of games the rating is based on
        eloRank: function (match) {
            const m = match.round.tourney.getMatchesByPlayer(player).length;
            const K = 800 / (player.Ne + m);
            return new EloRank(K);
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
 * @constant {Player} DUMMYPLAYER
 */
const DUMMYPLAYER = createPlayer(
    {
        firstName: "Dummy",
        dummy: true,
        rating: 0
    }
);

export {DUMMYPLAYER, createPlayer};