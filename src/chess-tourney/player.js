import EloRank from "elo-rank";

/**
 * Represents an indivudal player. Call it with `Player("John", ...)` or
 * `Player({firstName: "John", ...})`. The latter is convenient for converting
 * JSON objects.
 * @param {string or object} firstName
 * @param {string} lastName
 * @param {int}        rating
 */
function Player(firstName, lastName = "", rating = 1200) {
    this.dummy = false;
    this.Ne = 0; // number of games the rating is based on
    if (typeof firstName === "object") {
        Object.assign(this, firstName);
    } else {
        this.firstName = firstName;
        this.lastName = lastName;
        this.rating = rating;
    }
}

Player.prototype.eloRank = function (match) {
    const m = match.round.tourney.playerMatchHistory(this).length;
    const K = 800 / (this.Ne + m);
    return new EloRank(K);
};

/**
 * A stand-in for bye matches.
 * @constant {Player} DUMMYPLAYER
 */
const DUMMYPLAYER = new Player("Dummy");
DUMMYPLAYER.dummy = true;
DUMMYPLAYER.rating = 0;

export {DUMMYPLAYER, Player};