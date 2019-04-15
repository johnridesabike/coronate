// @ts-check
import {dummyPlayer} from "./player";
import {last} from "lodash";
import pairPlayers from "./pairing";
import createMatch from "./match";
/**
 * @typedef {import("./tournament").Tournament} Tournament
 * @typedef {import("./player").Player} Player
 * @typedef {import("./match").Match} Match
 */
/**
 * @typedef {Object} Round
 * @property {number} id
 * @property {Tournament} ref_tourney
 * @property {Player[]} roster
 * @property {Round} ref_prevRound
 * @property {Match[]} matches
 * @property {function(): boolean} isComplete
 * @property {function(Player): Match} getMatchByPlayer
 * @property {function(Player): number} playerColor `0` for white, `1` for
 * black, or `-1` if the player wasn't found.
 * @property {function(Player)} addPlayer
 * @property {function(): boolean} hasBye
 * @property {function(Match)} removeMatch
 * @property {function(): Match[]} autoPair
 */

/**
 *
 * @param {Tournament} tourney
 * @param {Object} importObj
 * @param {number} [importObj.id]
 * @param {Player[]} [importObj.roster]
 * @param {Match[]} [importObj.matches]
 * @returns {Round}
 */
function createRound(tourney, importObj = {}) {
    /** @type {Round} */
    const round = {
        id: (
            (importObj.id !== undefined)
            ? importObj.id
            : tourney.roundList.length
        ),
        ref_tourney: tourney,
        roster: importObj.roster || tourney.players.getActive(),
        ref_prevRound: last(tourney.roundList),
        matches: importObj.matches || [],
        isComplete() {
            return !round.matches.map((m) => m.isComplete()).includes(false);
        },
        getMatchByPlayer(player) {
            let theMatch = null;
            round.matches.forEach(function (match) {
                if (match.roster.includes(player)) {
                    theMatch = match;
                }
            });
            return theMatch;
        },
        playerColor(player) {
            let color = -1;
            const match = round.getMatchByPlayer(player);
            if (match) {
                color = match.getPlayerColor(player);
            }
            return color;
        },
        addPlayer(player) {
            round.roster.push(player);
            return round;
        },
        hasBye() {
            return round.roster.includes(dummyPlayer);
        },
        removeMatch(match) {
            if (typeof match === "number") {
                match = round.matches[match];
            }
            match.resetResult();
            match.roster.forEach(function (player) {
                player.matchCount -= 1;
            });
            round.matches = round.matches.filter((m) => m !== match);
            return round;
        },
        autoPair() {
            round.matches = pairPlayers(round);
            round.matches.forEach(function (match, index) {
                match.id = index;
            });
            return round.matches;
        }
    };
    round.roster = round.roster.map(function (player) {
        if (typeof player === "number") {
            return tourney.players.getPlayerById(player);
        } else {
            return player;
        }
    });
    // If match data was imported, then init it.
    round.matches = round.matches.map(
        (matchData) => createMatch(
            Object.assign(matchData, {ref_round: round})
        )
    );
    return round;
}

export default Object.freeze(createRound);