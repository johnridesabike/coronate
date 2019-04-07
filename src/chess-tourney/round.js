import {dummyPlayer} from "./player";
import {last} from "lodash";
import pairPlayers from "./pairing";

/**
 * Create an object to represent a round in a tournament.
 * @param {object} tourney The tournament containing the round.
 */
function createRound(tourney) {
    const round = {
        id: tourney.roundList.length,
        tourney: tourney,
        roster: tourney.roster.getActive(),
        prevRound: last(tourney.roundList),
        matches: [],
        isComplete() {
            return !round.matches.map((m) => m.isComplete()).includes(false);
        },
        getMatchByPlayer(player) {
            var theMatch = null;
            round.matches.forEach(function (match) {
                if (match.players.includes(player)) {
                    theMatch = match;
                }
            });
            return theMatch;
        },
        playerColor(player) {
            var color = -1;
            const match = round.getMatchByPlayer(player);
            if (match) {
                color = match.getPlayerColor(player);
            }
            return color;
        },
        addPlayer(player) {
            round.players.push(player);
            return round;
        },
        hasDummy() {
            return round.roster.includes(dummyPlayer);
        }
    };
    round.matches = pairPlayers(round);
    return round;
}

export default Object.freeze(createRound);