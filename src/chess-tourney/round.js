import {DUMMYPLAYER} from "./player";
import {playerColorBalance, playerScore} from "./scores";
import {chunk, flatten, last, zip} from "lodash";
import {pairPlayers} from "./pairing-old";
import { firstBy } from "thenby";
import createMatch from "./match";

function pairPlayers2(round) {
    const matches = [];
    const tourney = round.tourney;
    var byeMatch;
    const playerData = round.roster.map(function (player) {
        return {
            player: player,
            score: playerScore(tourney, player, round.id),
            lastColor: round.prevRound.playerColor(player),
            colorBalance: tourney.playerColorBalance(player),
            upperHalf: false
        };
    });
    const scoreList = new Set(playerData.map((p) => p.score));

    /**
     * If there's an odd number of players, assign a bye to the lowest-rated
     * player in the lowest score group. (USCF § 29L2.)
     */
    playerData.sort(
        firstBy((p) => p.score, -1).thenBy((p) => p.player.rating, -1)
    );
    if (playerData.length % 2 !== 0) {
        byeMatch = createMatch(last(playerData).player, DUMMYPLAYER);
        matches.push(byeMatch);
    }
    /**
     * calc upper/lower halves
     */
    scoreList.forEach(function (score) {
        var playersWithScore = playerData.filter((pd) => pd.score === score);
        playersWithScore.sort((pd) => pd.player.rating).reverse();
        // The first chunk is the upper half
        chunk(
            playersWithScore,
            playersWithScore.length / 2
        )[0].forEach(function (playerDatum) {
            playerDatum.upperHalf = true;
        });
    });
}

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
        playerTree: {},
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
            return round.roster.includes(DUMMYPLAYER);
        }
    };
    round.matches = pairPlayers(round);
    return round;
}

export default Object.freeze(createRound);