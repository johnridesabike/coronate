// @ts-check
import {firstBy} from "thenby";
import {chunk, last} from "lodash";
import blossom from "edmonds-blossom";
import createMatch from "./match";
import scores from "./scores";
import {dummyPlayer} from "./player";

/**
 * @typedef {import("./player").Player} Player
 * @typedef {import("./round").Round} Round
 * @typedef {import("./match").Match} Match
 * @typedef {import("./tournament").Tournament} Tournament
 */
/**
 * @typedef {Object} playerDataType
 * @property {Player} player
 * @property {number} id
 * @property {number} score
 * @property {(number | null)} dueColor
 * @property {number} colorBalance
 * @property {Player[]} opponentHistory
 * @property {boolean} upperHalf
 */

/**
 * TODO: These probably need to be tweaked a lot.
 */
/**
 * @constant avoidMeetingTwicePriority The weight given to avoid players
 * meeting twice. This is the highest priority. (USCF § 27A1)
 * @type {number}
 */
const avoidMeetingTwicePriority = 20;
/**
 * @constant sameScoresPriority The weight given to match players with
 * equal scores. This gets muliplied against a ratio taken from the distance
 * between each player's score. For example, if the tournament has players
 * scoring 0, 1, 2, and 3, and if a player scoring 1 gets compared with a
 * player scoring 3, then their `sameScoresPriority` will be reduced by 50%.
 * (`(3 - 1) / 4 = 0.5`) (USCF § 27A2)
 * @type {number}
 */
const sameScoresPriority = 16;
/**
 * @constant differentHalfPriority The weight given to match players in lower
 * versus upper halves. This is only applied to players being matched within
 * the same score group. (USCF § 27A3)
 * @type {number}
 */
const differentHalfPriority = 2;
/**
 * @constant differentDueColorPriority The weight given to match players with
 * opposite due colors. (USCF § 27A4 and § 27A5)
 * @type {number}
 */
const differentDueColorPriority = 1;
/**
 * @type {number}
 */
const maxPriority = (
    avoidMeetingTwicePriority
    + sameScoresPriority
    + differentHalfPriority
    + differentDueColorPriority
);

/**
 * Creates pairings according to the rules specified in USCF § 27, § 28,
 * and § 29. This is a work in progress and does not account for all of the
 * rules yet.
 * @param {Round} round The round object.
 */
function pairPlayers(round) {
    /**
     * @type {Match}
     */
    let byeMatch;
    /**
     * @type {Array<Array<number>>}
     */
    let potentialMatches;
    /**
     * @type {Match[]}
     */
    let matches;
    /**
     * @type {number[]}
     */
    let blossomResults;
    /**
     * @type {Array<[playerDataType, playerDataType, number]>}
     */
    let reducedResults;
    /**
     * @type {Tournament}
     */
    const tourney = round.ref_tourney;
    /**
     * @param {Player} player
     * @returns {number | null}
     */
    const dueColor = function (player) {
        if (!round.ref_prevRound) {
            return null;
        }
        let color = 0;
        let prevColor = round.ref_prevRound.playerColor(player);
        if (prevColor === 0) {
            color = 1;
        }
        return color;
    };
    /**
     * @type {playerDataType[]}
     */
    let playerData = round.roster.map(function (player, id) {
        return {
            player: player,
            id: id,
            score: scores.playerScore(tourney, player, round.id),
            dueColor: dueColor(player),
            colorBalance: scores.playerColorBalance(tourney, player),
            opponentHistory: tourney.getPlayersByOpponent(player, null),
            upperHalf: false
        };
    });
    const scoreList = Array.from(new Set(playerData.map((p) => p.score)));
    scoreList.sort();
    // Sort the data so matchups default to order by score and rating.
    playerData.sort(
        firstBy((p) => p.score, -1).thenBy((p) => p.player.rating, -1)
    );
    /**
     * Create an array of blossom-compatible weighted matchups. This returns
     * an array of each potential match, formatted like so: [idOfPlayer1,
     * idOfPlayer2, priority]. A higher priority means a more likely matchup.
     * Use it in `Array.prototype.reduce()`.
     * @param {array} allMatches The running list of all possible matchups.
     * @param {object} player1 The data for the first player.
     * @param {number} ignore The index of the player.
     * @param {array} src The original array.
     */
    const matchupReducer = function (allMatches, player1, ignore, src) {
        let opponents = src.filter((p) => p !== player1);
        let playerMatches = opponents.map(function (player2) {
            let priority = 0;
            let scoreDiff;
            if (!player1.opponentHistory.includes(player2.player)) {
                priority += avoidMeetingTwicePriority;
            }
            // Calculate the "distance" between their scores and multiply that
            // against the `sameScoresPriority` constant.
            scoreDiff = Math.abs(
                scoreList.indexOf(player1.score)
                - scoreList.indexOf(player2.score)
            );
            scoreDiff = (scoreList.length - scoreDiff) / scoreList.length;
            priority += sameScoresPriority * scoreDiff;
            // Only include `differentHalfPriority` if they're in the same
            // score group.
            if (player1.score === player2.score) {
                if (player1.upperHalf !== player2.upperHalf) {
                    priority += differentHalfPriority;
                }
            }
            if (player1.dueColor === null) {
                priority += differentDueColorPriority;
            } else if (player1.dueColor !== player2.dueColor) {
                priority += differentDueColorPriority;
            }
            return [player1.id, player2.id, Math.ceil(priority)];
        });
        allMatches = allMatches.concat(playerMatches);
        return allMatches;
    };

    // If there's an odd number of players, time to assign a bye.
    if (playerData.length % 2 !== 0) {
        // Get the next person in line from bye signups.
        let byePlayer = tourney.byeQueue.filter(
            (p) => !p.hasHadBye(tourney)
        )[0];
        let byePlayerData = playerData.filter(
            (pd) => pd.player === byePlayer
        )[0];
        // If there isn't anyone on the list, assign a bye to the lowest-rated
        // player in the lowest score group. (USCF § 29L2.)
        if (!byePlayerData) {
            byePlayerData = last(
                playerData.filter(
                    (p) => !p.player.hasHadBye(tourney)
                )
            );
        }
        // In the impossible situation that *everyone* has played a bye round
        // previously, then just pick the last player.
        if (!byePlayerData) {
            byePlayerData = last(playerData);
        }
        byeMatch = createMatch({
            ref_round: round,
            roster: [byePlayerData.player, dummyPlayer]
        });
        // Remove the bye'd player from the list so they won't be matched again.
        playerData = playerData.filter((p) => p !== byePlayerData);
    }
    // Determine which players are in the upper and lower halves of their score
    // groups.
    scoreList.forEach(function (score) {
        let playersWithScore = playerData.filter((pd) => pd.score === score);
        playersWithScore.sort((pd) => pd.player.rating).reverse();
        if (playersWithScore.length > 1) {
            // The first chunk is the upper half
            chunk(
                playersWithScore,
                playersWithScore.length / 2
            )[0].forEach(function (playerDatum) {
                playerDatum.upperHalf = true;
            });
        }
    });
    // Run the reducer. See `matchupReducer()` for info.
    potentialMatches = playerData.reduce(matchupReducer, []);
    // Feed all of the potential matches to Edmonds-blossom and let the
    // algorithm work its magic. This returns an array where each index is the
    // ID of one player and each value is the ID of the matched player.
    blossomResults = blossom(potentialMatches);
    // Translate those IDs into actual pairs of players.
    reducedResults = blossomResults.reduce(
        function (matches, p1Id, p2Id) {
            // Filter out unmatched players. (Even though we removed the byes
            // from the list, blossom will automatically include their missing
            // IDs in its results.)
            if (p1Id !== -1) {
                let p1 = playerData.filter((p) => p.id === p1Id)[0];
                let p2 = playerData.filter((p) => p.id === p2Id)[0];
                let ideal = potentialMatches.filter(
                    (pair) => pair[0] === p1Id && pair[1] === p2Id
                )[0][2];
                /**
                 * @type {Array}
                 */
                let matched = matches.map((pair) => pair[0]);
                // let matched = matches.map((pair) => pair[0]);
                // Blossom returns a lot of redundant matches. Check that this
                // matchup wasn't already added.
                if (!matched.includes(p1) && !matched.includes(p2)) {
                    matches.push([p1, p2, ideal]);
                }
            }
            return matches;
        },
        []
    );
    // Sort by net score and rating for board placement.
    reducedResults.sort(
        firstBy(
            (pair) => pair[0].score + pair[1].score,
            -1
        ).thenBy(
            (pair) => pair[0].rating + pair[1].rating,
            -1
        )
    );
    // Turn the results into new match objects.
    matches = reducedResults.map(
        function (pair) {
            const player1 = pair[0];
            const player2 = pair[1];
            const ideal = pair[2];
            const match = createMatch({
                ref_round: round,
                roster: [player1.player, player2.player]
            });
            match.ideal = ideal / maxPriority;
            // A quick-and-easy way to keep colors mostly equal.
            if (player1.colorBalance < player2.colorBalance) {
                match.reverse();
            }
            // When the match isn't ideal, include a warning.
            if (player1.opponentHistory.includes(player2.player)) {
                match.warnings += (
                    " " + player1.player.firstName
                    + " and " + player2.player.firstName
                    + " have played previously."
                );
            }
            [player1, player2].forEach(function (player) {
                if (Math.abs(player.colorBalance) > 2) {
                    match.warnings += (
                        " " + player.player.firstName
                        + "'s color balance is off"
                    );
                }
            });
            return match;
        }
    );
    // The bye match always gets added last so as not to affect the numbering.
    if (byeMatch) {
        matches.push(byeMatch);
    }
    return matches;
}

export default Object.freeze(pairPlayers);