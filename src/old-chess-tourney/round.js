// @ts-check
import {dummyPlayer} from "./player";
import {last, difference} from "lodash";
// import pairPlayers from "./pairing";
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
 * @property {number[]} roster
 * @property {Round} ref_prevRound
 * @property {Match[]} matches
 * @property {function(): boolean} isComplete
 * @property {(player: number) => Match} getMatchByPlayer
 * @property {(player: number) => number} playerColor `0` for white, `1` for
 * black, or `-1` if the player wasn't found.
 * @property {(position: number) => Match[]} removeMatch
 * @property {(addDummy?: boolean) => number[]} getUnmatchedPlayers
 * @property {(white: number, black: number) => Match} setPair
 */

/**
 *
 * @param {Tournament} tourney
 * @param {Object} importObj
 * @param {number} [importObj.id]
 * @param {number[]} [importObj.roster]
 * @param {Match[]} [importObj.matches]
 * @returns {Round}
 */
function createRound(tourney, importObj = {}) {
    const getPlayer = tourney.players.getPlayerById;
    /** @type {Round} */
    const round = {
        id: (
            (importObj.id !== undefined)
            ? importObj.id
            : tourney.roundList.length
        ),
        ref_tourney: tourney,
        roster: importObj.roster || tourney.getActive(),
        ref_prevRound: last(tourney.roundList),
        matches: importObj.matches || [],
        isComplete() {
            const matchesComplete = !round.matches.map(
                (m) => m.isComplete()
            ).includes(false);
            const allPlayersPaired = round.getUnmatchedPlayers().length === 0;
            return matchesComplete && allPlayersPaired;
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
        removeMatch(position) {
            const match = round.matches[position];
            match.resetResult();
            match.roster.forEach(function (id) {
                if (id !== dummyPlayer.id) {
                    getPlayer(id).matchCount -= 1;
                }
            });
            round.matches = round.matches.filter((m) => m !== match);
            return round.matches;
        },
        // autoPair() {
        //     const players = round.getUnmatchedPlayers(false);
        //     round.matches = round.matches.concat(pairPlayers(round, players)
        //);
        //     return round.matches;
        // },
        getUnmatchedPlayers(addDummy = true) {
            /** @type {number[]} */
            const matched = round.matches.reduce(
                (accumulator, match) => accumulator.concat(match.roster),
                []
            );
            const unMatched = difference(round.roster, matched);
            if (unMatched.length % 2 !== 0 && addDummy) {
                unMatched.push(-1);
            }
            return unMatched;
        },
        setPair(white, black) {
            const match = createMatch(
                {roster: [white, black]},
                tourney.players
            );
            round.matches.push(match);
            return match;
        }
    };
    round.matches = round.matches.map(
        (matchData) => createMatch(
            Object.assign(matchData, {ref_round: round})
        )
    );
    return round;
}

export default Object.freeze(createRound);

/**
 * @param {number} playerId
 * @param {Match[]} matchList
 */
export function playerColor(playerId, matchList) {
    let color = -1;
    const match = matchList.filter((m) => m.roster.includes(playerId))[0];
    if (match) {
        color = match.getPlayerColor(playerId);
    }
    return color;
}