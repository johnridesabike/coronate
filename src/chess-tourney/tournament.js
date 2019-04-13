// @ts-check
import createRound from "./round";
import {createPlayerManager, playerList} from "./player";
import {last, times} from "lodash";
import {createDefaultConfig} from "./config";
/**
 * @typedef { import("./player").player } player
 * @typedef { import("./player").playerManager } playerManager
 * @typedef { import("./player").defaultPlayerManager } defaultPlayerManager
 * @typedef { import("./round").round } round
 * @typedef { import("./match").match } match
 * @typedef { import("./config").configItem } configItem
 */
/**
 * @typedef {Object} tournament
 * @property {number} id
 * @property {string} name
 * @property {Array<round>} roundList
 * @property {number} byeValue
 * @property {Array<player>} byeQueue
 * @property {playerManager} players
 * @property {configItem[]} tieBreak
 * @property {function(): boolean} isNewRoundReady
 * @property {(player, number) => match[]} getMatchesByPlayer
 * @property {function(player, number): Array<player>} getPlayersByOpponent
 * @property {function(): number} getNumOfRounds
 * @property {function(): (round | false)} newRound
 * @property {function(round)} removeRound
 * @property {function(round)} canRemoveRound
 * @property {function(player)} addPlayerToByeQueue
 * @property {function(player)} removePlayerFromByeQueue
 * @property {function(Array<player>)} setByeQueue
*/
/**
 * @typedef {Object} defaultTourney
 * @property {number} id
 * @property {string} name
 * @property {Array<round>} roundList
 * @property {number} byeValue
 * @property {Array<player>} byeQueue
 * @property {playerManager} players
 * @property {configItem[]} tieBreak
 */
/**
 * @type {defaultTourney}
 */
const defaultProps = {
    id: 0,
    name: "",
    roundList: [],
    byeValue: 0,
    byeQueue: [],
    players: createPlayerManager(playerList([])),
    tieBreak: createDefaultConfig().tieBreak
};

/**
 *
 * @param {defaultTourney} importObj
 * @param {?playerManager} playerSource
 * @returns {tournament}
 */
function createTournament(importObj = defaultProps, playerSource = null) {
   /**
    * @type {tournament}
    */
    const tourney = {
        id: importObj.id || defaultProps.id,
        name: importObj.name || defaultProps.name,
        roundList: importObj.roundList || defaultProps.roundList,
        byeValue: importObj.byeValue || defaultProps.byeValue,
        byeQueue: importObj.byeQueue || defaultProps.byeQueue,
        players: importObj.players || defaultProps.players,
        tieBreak: importObj.tieBreak || createDefaultConfig().tieBreak,
        isNewRoundReady() {
            let isReady = false;
            if (tourney.roundList.length > 0) {
                isReady = last(tourney.roundList).isComplete();
            } else {
                isReady = (tourney.players.roster.length > 0);
            }
            return isReady;
        },
        getMatchesByPlayer(player, roundId = null) {
            if (roundId === null) {
                roundId = tourney.roundList.length;
            }
            let matches = [];
            times(roundId + 1, function (i) {
                if (tourney.roundList[i] !== undefined) {
                    tourney.roundList[i].matches.forEach(function (match) {
                        if (match.roster.indexOf(player) !== -1) {
                            matches.push(match);
                        }
                    });
                }
            });
            return matches;
        },
        getPlayersByOpponent(opponent, roundId = null) {
            let players = [];
            tourney.getMatchesByPlayer(opponent, roundId).forEach(
                function (match) {
                    players = players.concat(
                        match.roster.filter(
                            (player) => player !== opponent
                        )
                    );
                }
            );
            return players;
        },
        getNumOfRounds() {
            let roundId = Math.ceil(
                Math.log2(tourney.players.getActive().length)
            );
            if (roundId === -Infinity) {
                roundId = 0;
            }
            return roundId;
        },
        newRound() {
            if (!tourney.isNewRoundReady()) {
                return false;
            }
            let newRound = createRound(tourney);
            tourney.roundList.push(newRound);
            return newRound;
        },
        removeRound(round) {
            if (typeof round === "number" || typeof round === "string") {
                round = tourney.roundList[round];
            }
            if (tourney.canRemoveRound(round)) {
                throw new Error("You can only remove the last round");
            }
            round.matches.forEach(function (match) {
                round.removeMatch(match);
            });
            tourney.roundList = tourney.roundList.filter((r) => r !== round);
            return tourney;
        },
        canRemoveRound(round) {
            return round !== last(tourney.roundList);
        },
        addPlayerToByeQueue(player) {
            tourney.byeQueue.push(player);
            return tourney;
        },
        removePlayerFromByeQueue(player) {
            tourney.byeQueue = tourney.byeQueue.filter((p) => p !== player);
            return tourney;
        },
        setByeQueue(playerList) {
            tourney.byeQueue = playerList;
            return tourney;
        }
    };
    // Importing JSON-parsed data
    if (typeof importObj === "object") {
        Object.assign(tourney, importObj);
    }
    // if (tourney.players) {
    //     // If roster data was imported, then init it.
    //     tourney.players = createPlayerManager(tourney.players, playerSource);
    // } else {
    //     // create a blank roster
    //     tourney.players = createPlayerManager({}, playerSource);
    // }
    tourney.players = createPlayerManager(tourney.players, playerSource);
    tourney.players.ref_tourney = tourney;
    if (tourney.roundList.length >= 0) {
        // If round data was imported, then init it.
        tourney.roundList = tourney.roundList.reduce(
            function (roundList, roundData) {
                roundData.ref_prevRound = last(roundList) || null;
                roundList.push(createRound(tourney, roundData));
                return roundList;
            },
            []
        );
    }
    return tourney;
}

export default Object.freeze(createTournament);
