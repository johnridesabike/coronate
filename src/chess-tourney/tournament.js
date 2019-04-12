// @flow
import createRound from "./round";
import {createPlayerManager} from "./player";
import {last, times, cloneDeep} from "lodash";
import config from "./default-config.json";

/*::
import type {playerManager} from "./player";
import type {round} from "./round";
export type tournament = {
    id: number,
    name: string,
    roundList: Array<round>,
    byeValue: number,
    byeQueue: Array<mixed>,
    players: ?playerManager,
    tieBreak: config,
    getPlayersByOpponent: function,
    getMatchesByPlayer: function,
    canRemoveRound: function
}
*/

function createTournament(
    importObj/*:tournament | string*/ = "",
    playerSource/*:?playerManager*/ = null
) {
    let name;
    if (typeof importObj === "string") {
        name = importObj;
    } else {
        name = importObj.name;
    }
    const tourney/*:tournament*/ = {
        id: 0,
        /**
         * @property {string} name The display name of the tournament.
         */
        name: name,
        /**
         * @property {array} roundList The list of rounds.
         */
        roundList: [],
        /**
         * @property {number} byeValue How many points a bye is worth. USCF
         * suggests either 1 or 0.5.
         */
        byeValue: 1,
        /**
         * @property {array} byeQueue A list of players signed up for bye
         * rounds, if byes are necessary.
         */
        byeQueue: [],
        /**
         * @property {object} roster The roster object.
         */
        players: importObj.players || null,
        tieBreak: cloneDeep(config.tieBreak),
        /**
         * Get if a new round is ready or not.
         * @returns {bool} `True` if a round is ready, `false` if not.
         */
        isNewRoundReady() {
            let isReady = false;
            if (tourney.roundList.length > 0) {
                isReady = last(tourney.roundList).isComplete();
            } else {
                isReady = (tourney.players.roster.length > 0);
            }
            return isReady;
        },
        /**
         * Get a list of matches containing a particular player.
         * @param {object} player The specified player.
         * @param {number} roundId The round to fetch up to.
         * @returns {array} The list of matches.
         */
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
        /**
         * Get a list of players who have played a specified player.
         * @param {object} player The specified player.
         * @param {number} roundId The round to fetch up to.
         * @returns {array} A list of player objects.
         */
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
        /**
         * Get the minimum number of rounds based on the number of players.
         * @returns {number} The number of rounds.
         */
        getNumOfRounds() {
            let roundId = Math.ceil(
                Math.log2(tourney.players.getActive().length)
            );
            if (roundId === -Infinity) {
                roundId = 0;
            }
            return roundId;
        },
        /**
         * Create a new round and add it to the round list.
         * @returns {object} The new round object.
         */
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
        /**
         * Add a player to the bye queue.
         * @param {object} player The player object.
         * @returns {object} This tournament object.
         */
        addPlayerToByeQueue(player) {
            tourney.byeQueue.push(player);
            return tourney;
        },
        /**
         * Remove a player from the bye queue.
         * @param {object} player The player object.
         * @returns {object} This tournament object.
         */
        removePlayerFromByeQueue(player) {
            tourney.byeQueue = tourney.byeQueue.filter((p) => p !== player);
            return tourney;
        },
        setByeQueue(playerList) {
            tourney.byQueue = playerList;
            return tourney;
        }
    };
    // Importing JSON-parsed data
    if (typeof importObj === "object") {
        Object.assign(tourney, importObj);
    }
    if (tourney.players) {
        // If roster data was imported, then init it.
        tourney.players = createPlayerManager(tourney.players, playerSource);
    } else {
        // create a blank roster
        tourney.players = createPlayerManager({}, playerSource);
    }
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
