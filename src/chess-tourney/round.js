import {dummyPlayer} from "./player";
import {last} from "lodash";
import pairPlayers from "./pairing";

/**
 * Create an object to represent a round in a tournament.
 * @param {object} tourney The tournament containing the round.
 */
function createRound(tourney) {
    const round = {
        /**
         * @property {number} id The ID number of the round.
         */
        id: tourney.roundList.length,
        /**
         * @property {object} ref_tourney A reference to the tournament
         * containing this round.
         */
        ref_tourney: tourney,
        /**
         * @property {array} roster The list of players in this round.
         */
        roster: tourney.roster.getActive(),
        /**
         * @property {object} prevRound The round previous to this one.
         */
        ref_prevRound: last(tourney.roundList) || null,
        /**
         * @property {array} matches The list of match objects.
         */
        matches: [],
        /**
         * Get whether or not all of the matches in this round have completed.
         * @returns {bool} `True` if they have all completed, `false` if they
         * haven't.
         */
        isComplete() {
            return !round.matches.map((m) => m.isComplete()).includes(false);
        },
        /**
         * Get the match player has played in.
         * @param {object} player The player.
         * @returns {?object} The match object or `null` if no match is
         * found.
         */
        getMatchByPlayer(player) {
            let theMatch = null;
            round.matches.forEach(function (match) {
                if (match.players.includes(player)) {
                    theMatch = match;
                }
            });
            return theMatch;
        },
        /**
         * Get the color of a player for this round.
         * @param {object} player The player.
         * @returns {number} `0` for white, `1` for black, or `-1` if the player
         * wasn't found.
         */
        playerColor(player) {
            let color = -1;
            const match = round.getMatchByPlayer(player);
            if (match) {
                color = match.getPlayerColor(player);
            }
            return color;
        },
        /**
         * Add a player to the round.
         * TODO: I don't think this is used.
         * @param {object} player The player.
         * @returns {object} this round.
         */
        addPlayer(player) {
            round.players.push(player);
            return round;
        },
        /**
         * Get whether or not this round has a bye round.
         * TODO: I don't thin this is used.
         * @returns {bool} `True` if it does, `false` if it doesn't.
         */
        hasBye() {
            return round.roster.includes(dummyPlayer);
        },
        /**
         * Remove a match. This undoes the results of the match.
         * @param {number|object} match The object or ID of the match.
         * @returns {object} This round object.
         */
        removeMatch(match) {
            if (typeof match === "number") {
                match = round.matches[match];
            }
            match.resetResult();
            round.matches = round.matches.filter((m) => m !== match);
            return round;
        },
        toJSON(key) {
            if (key === "prevRound") {
                return round.id;
            } else {
                return round;
            }
        }
    };
    round.matches = pairPlayers(round);
    return round;
}

export default Object.freeze(createRound);