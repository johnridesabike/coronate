import createRoster from "./roster";
import createRound from "./round";
import {last, times} from "lodash";
import config from "./default-config.json";

function createTournament(importObj = "") {
    let name;
    if (typeof importObj === "string") {
        name = importObj;
    } else {
        name = importObj.name;
    }
    const tourney = {
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
        roster: null,
        tieBreak: config.tieBreak,
        /**
         * Get if a new round is ready or not.
         * @returns {bool} `True` if a round is ready, `false` if not.
         */
        isNewRoundReady() {
            let isReady = false;
            if (tourney.roundList.length > 0) {
                isReady = last(tourney.roundList).isComplete();
            } else {
                isReady = (tourney.roster.all.length > 0);
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
                        if (match.players.indexOf(player) !== -1) {
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
                        match.players.filter(
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
                Math.log2(tourney.roster.getActive().length)
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
            if (round !== last(tourney.roundList)) {
                throw new Error("You can only remove the last round");
            }
            round.matches.forEach(function (match) {
                round.removeMatch(match);
            });
            tourney.roundList = tourney.roundList.filter((r) => r !== round);
            return tourney;
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
        }
    };
    // Importing JSON-parsed data
    if (typeof importObj === "object") {
        Object.assign(tourney, importObj);
    }
    if (tourney.roster) {
        // If roster data was imported, then init it.
        tourney.roster = createRoster(tourney, tourney.roster);
    } else {
        // create a blank roster
        tourney.roster = createRoster(tourney);
    }
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
