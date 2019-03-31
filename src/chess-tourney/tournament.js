import newRoster from "./roster";
import createRound from "./round";
import {last, times} from "lodash";

function createTournament(name = "", playerList = []) {
    const tourney = {
        name: name,
        roundList: [],
        byeValue: 1,
        isNewRoundReady: function () {
            var isReady = false;
            if (tourney.roundList.length > 0) {
                isReady = last(tourney.roundList).isComplete();
            } else {
                isReady = (tourney.roster.all.length > 0);
            }
            return isReady;
        },
        getMatchesByPlayer: function (player, roundId = null) {
            if (roundId === null) {
                roundId = tourney.roundList.length;
            }
            var matches = [];
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
        getPlayersByOpponent: function (opponent, roundId = null) {
            var players = [];
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
        getNumOfRounds: function () {
            var roundId = Math.ceil(
                Math.log2(tourney.roster.getActive().length)
            );
            if (roundId === -Infinity) {
                roundId = 0;
            }
            return roundId;
        },
        newRound: function () {
            if (!tourney.isNewRoundReady()) {
                return false;
            }
            var newRound = createRound(
                tourney,
                tourney.roundList.length,
                last(tourney.roundList),
                tourney.roster.getActive()
            );
            tourney.roundList.push(newRound);
            return newRound;
        }
    };
    tourney.roster = newRoster(tourney, playerList);
    return tourney;
}

export default Object.freeze(createTournament);
