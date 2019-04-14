// @ts-check
import createRound from "./round";
import {createPlayerManager} from "./player-manager";
import {last, times} from "lodash";
import {createDefaultConfig} from "./config";
/**
 * @typedef {import("./player").Player} Player
 * @typedef {import("./player-manager").PlayerManager } PlayerManager
 * @typedef {import("./round").Round} Round
 * @typedef {import("./match").Match} Match
 * @typedef {import("./config").ConfigItem} ConfigItem
 */
/**
 * @typedef {Object} Tournament
 * @property {number} id
 * @property {string} name
 * @property {Round[]} roundList
 * @property {number} byeValue
 * @property {Player[]} byeQueue
 * @property {PlayerManager} players
 * @property {ConfigItem[]} tieBreak
 * @property {function(): boolean} isNewRoundReady
 * @property {function(Player, number): Match[]} getMatchesByPlayer
 * @property {function(Player, (number | null)=): Player[]} getPlayersByOpponent
 * @property {function(): number} getNumOfRounds
 * @property {function(): (Round | false)} newRound
 * @property {function(Round)} removeRound
 * @property {function(Round)} canRemoveRound
 * @property {function(Player)} addPlayerToByeQueue
 * @property {function(Player)} removePlayerFromByeQueue
 * @property {function(Player[])} setByeQueue
*/
/**
 *
 * @param {Object} importObj
 * @param {number} [importObj.id]
 * @param {string} [importObj.name]
 * @param {Round[]} [importObj.roundList]
 * @param {number} [importObj.byeValue]
 * @param {Player[]} [importObj.byeQueue]
 * @param {PlayerManager} [importObj.players]
 * @param {ConfigItem[]} [importObj.tieBreak]
 * @param {PlayerManager} [playerSource]
 * @returns {Tournament}
 */
function createTournament(importObj = {}, playerSource = null) {
   /**
    * @type {Tournament}
    */
    const tourney = {
        id: importObj.id || 0,
        name: importObj.name || "",
        roundList: importObj.roundList || [],
        byeValue: importObj.byeValue || 1,
        byeQueue: importObj.byeQueue || [],
        players: importObj.players || createPlayerManager(),
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
            /**
             * @type {Match[]}
             */
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
            /**
             * @type {Player[]}
             */
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
    tourney.players = createPlayerManager(tourney.players, playerSource);
    tourney.players.ref_tourney = tourney;
    if (tourney.roundList.length >= 0) {
        // If round data was imported, then init it.
        tourney.roundList = tourney.roundList.reduce(
            /**
             * @param {Round[]} roundList
             * @param {Object} roundData
             */
            function (roundList, roundData) {
                roundData.ref_prevRound = last(roundList) || null;
                roundList.push(createRound(tourney, roundData));
                return roundList;
            },
            /**
             * @type {Round[]}
             */
            []
        );
    }
    return tourney;
}

export default Object.freeze(createTournament);
