import EloRank from "elo-rank";
import {last} from "lodash";

/**
 * Represents an indivudal player. Call it with `createPlayer("John", ...)` or
 * `createPlayer({firstName: "John", ...})`. The latter is convenient for
 * converting JSON objects.
 * @param {object} firstName Either the person's first name or an object
 * containing all the parameters.
 * @param {string} lastName  The person's last name.
 * @param {int}    rating    The person's Elo rating.
 */
function createPlayer(playerDataObj) {
    const player = {
        /**
         * @property {number} id The ID number of the player. Used mainly for
         * JSON serialization.
         */
        id: 0,
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
         * @property {bool} dummy If true, this player won't count in certain
         * scorings.
         */
        dummy: false,
        /**
         * @property {number} Ne Number of games the rating is based on.
         */
        Ne: 0,
        /**
         * TODO
         */
        isReference: false
    };
    Object.assign(player, playerDataObj);

    // We define the method after `Object.assign` so that `player` references
    // the correct object.

    /**
     * Create an Elo calculator with an updated K-factor. See the `elo-rank`
     * NPM package for more information.
     * @param {object} tourney The current tournament.
     * @returns {object} An `EloRank` object.
     */
    player.eloRank = function (tourney) {
        const m = tourney.getMatchesByPlayer(player).length;
        const K = 800 / (player.Ne + m);
        return new EloRank(K);
    };
    /**
     * Get if a player has had a bye round.
     * @param {object} tourney The current tournament.
     * @returns {bool} True if the player has had a bye round, false if not.
     * TODO: move this to the tournament object?
     */
    player.hasHadBye = function (tourney) {
        return tourney.getPlayersByOpponent(player).includes(dummyPlayer);
    };
    player.toJSON = function (key) {
        if (key && player.isReference) {
            return player.id;
        } else {
            return player;
        }
    };
    return player;
}

/**
 * A stand-in for bye matches.
 * @constant {object} dummyPlayer
 */
const dummyPlayer = Object.freeze(
    createPlayer(
        {
            id: -1,
            firstName: "Bye",
            dummy: true,
            rating: 0
        }
    )
);

const globalRoster = {
    roster: [],
    /**
     * Add a player to the roster.
     * @param {object} player The player object to add.
     * @returns {object} This created player object.
     */
    addPlayer(player) {
        let lastPlayer = last(globalRoster.roster);
        if (lastPlayer) {
            player.id = last(globalRoster.roster).id + 1;
        } else {
            player.id = 0;
        }
        let newPlayer = createPlayer(player);
        globalRoster.roster.push(newPlayer);
        return newPlayer;
    },
    /**
     * Add a list of players to the roster.
     * @param {array} players A list of players to add.
     * @returns {array} The list of created player objects.
     */
    addPlayers(players) {
        let newPlayerList = players.map(
            (player) => globalRoster.addPlayer(player)
        );
        return newPlayerList;
    }
    // TODO remove players
};

export {dummyPlayer, createPlayer, globalRoster};
