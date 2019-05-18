import {firstBy} from "thenby";
import {splitAt, last} from "ramda";
import blossom from "edmonds-blossom";
import {createPlayerStats} from "./scoring";
import {DUMMY_ID} from "./constants";
/**
 * @typedef {import("./").PlayerStats} PlayerStats
 */

/**
 * TODO: These probably need to be tweaked a lot.
 */
/**
 * @constant avoidMeetingTwicePriority The weight given to avoid players
 * meeting twice. This same weight is given to avoid matching players on each
 * other's "avoid" list. This is the highest priority. (USCF § 27A1)
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
// /** @type {number} */
// const maxPriority = (
//     avoidMeetingTwicePriority
//     + sameScoresPriority
//     + differentHalfPriority
//     + differentDueColorPriority
// );


/**
 * Create an array of blossom-compatible weighted matchups. This returns
 * an array of each potential match, formatted like so: [idOfPlayer1,
 * idOfPlayer2, priority]. A higher priority means a more likely matchup.
 * @param {PlayerStats} player1
 * @param {PlayerStats} player2
 * @param {number[]} scoreList
 * @returns {number}
 */
export function calcPairIdeal(player1, player2, scoreList) {
    let priority = 0;
    let scoreDiff;
    const metBefore = player1.opponentHistory.includes(player2.id);
    const mustAvoid = player1.avoidList.includes(player2.id);
    if (!metBefore && !mustAvoid) {
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
    return Math.ceil(priority);
}

/**
 * Creates pairings according to the rules specified in USCF § 27, § 28,
 * and § 29. This is a work in progress and does not account for all of the
 * rules yet.
 * @param {object[][]} roundList
 * @param {number} roundId
 * @param {number[]} players
 * @param {object[]} playerList
 * @param {number[][]} avoidList
 */
export default function pairPlayers(
    players,
    roundId,
    roundList,
    playerList,
    avoidList
) {
    /** @type {[number, number]} */
    let byeMatch;
    let playerData = players.map((playerId) => (
        createPlayerStats(playerId, playerList, avoidList, roundList, roundId)
    ));
    const scoreList = Array.from(new Set(playerData.map((p) => p.score)));
    scoreList.sort();
    // Sort the data so matchups default to order by score and rating.
    playerData.sort(
        firstBy((p) => p.score, -1).thenBy((p) => p.rating, -1)
    );
    // If there's an odd number of players, time to assign a bye.
    if (playerData.length % 2 !== 0) {
        // Assign a bye to the lowest-rated player in the lowest score group.
        // (USCF § 29L2.)
        // filter out players who have had a bye already.
        let byePlayerData = last(playerData.filter((p) => !p.hasHadBye));
        // In the impossible situation that *everyone* has played a bye round
        // previously, then just pick the last player.
        if (!byePlayerData) {
            byePlayerData = last(playerData);
        }
        byeMatch = [byePlayerData.id, DUMMY_ID];
        // Remove the bye'd player from the list so they won't be matched again.
        playerData = playerData.filter((p) => p !== byePlayerData);
    }
    // Determine which players are in the upper and lower halves of their score
    // groups.
    scoreList.forEach(function (score) {
        let playersWithScore = playerData.filter((pd) => pd.score === score);
        playersWithScore.sort((pd) => pd.rating).reverse();
        if (playersWithScore.length > 1) {
            splitAt(
                playersWithScore.length / 2,
                playersWithScore
            )[0].forEach(function (playerDatum) {
                playerDatum.upperHalf = true;
            });
        }
    });
    // Turn the data into blossom-compatible input.
    const potentialMatches = playerData.reduce(
        function (acc, player1, ignore, src) {
            const playerMatches = src.filter(
                (player) => player !== player1
            ).map(
                (player2) => [
                    player1.id,
                    player2.id,
                    calcPairIdeal(player1, player2, scoreList)
                ]
            );
            return acc.concat(playerMatches);
        },
        []
    );
    // Feed all of the potential matches to Edmonds-blossom and let the
    // algorithm work its magic. This returns an array where each index is the
    // ID of one player and each value is the ID of the matched player.
    const blossomResults = blossom(potentialMatches);
    // Translate those IDs into actual pairs of players.
    /** @type {[PlayerStats, PlayerStats, number][]} */
    const reducedResults = blossomResults.reduce(
        function (acc, p1Id, p2Id) {
            // Filter out unmatched players. Even though we removed the byes
            // from the list, blossom will automatically include their missing
            // IDs in its results.
            if (p1Id !== -1) {
                const p1 = playerData.filter((p) => p.id === p1Id)[0];
                const p2 = playerData.filter((p) => p.id === p2Id)[0];
                const ideal = potentialMatches.filter(
                    (pair) => pair[0] === p1Id && pair[1] === p2Id
                )[0][2];
                const matched = acc.map((pair) => pair[0]);
                // Blossom returns a lot of redundant matches. Check that this
                // matchup wasn't already added.
                if (!matched.includes(p1) && !matched.includes(p2)) {
                    acc.push([p1, p2, ideal]);
                }
            }
            return acc;
        },
        []
    );
    // Sort by net score and rating for board placement.
    reducedResults.sort(
        firstBy(
            /** @param {[PlayerStats, PlayerStats, number]} pair */
            (pair) => pair[0].score + pair[1].score,
            -1
        ).thenBy(
            /** @param {[PlayerStats, PlayerStats, number]} pair */
            (pair) => pair[0].rating + pair[1].rating,
            -1
        )
    );
    // Turn the results into new match objects.
    const matches = reducedResults.map(
        function (pair) {
            const player1 = pair[0];
            const player2 = pair[1];
            // const ideal = pair[2];
            const match = [player1.id, player2.id];
            if (player1.colorBalance < player2.colorBalance) {
                match.reverse();
            }
            return match;
        }
    );
    // The bye match always gets added last so the the numbering isn't affected.
    if (byeMatch) {
        matches.push(byeMatch);
    }
    return matches;
}
