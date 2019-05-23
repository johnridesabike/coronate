// This file is a work in progress. The weighting for the ratings needs to be
// tweaked a lot, and the pairing function itself needs to be cleaned up and
// made more reusable.
import {
    AvoidList,
    DUMMY_ID,
    Player,
    PlayerStats,
    RoundList
} from "../data-types";
import {
    add,
    assoc,
    curry,
    filter,
    findLastIndex,
    lensIndex,
    map,
    over,
    pipe,
    reverse,
    sort,
    splitAt,
    view
} from "ramda";
import blossom from "edmonds-blossom";
import {createPlayerStats} from "./factories";
import {firstBy} from "thenby";
import t from "tcomb";

const priority = (value) => (condition) => condition ? value : 0;
const divisiblePriority = (value) => (divider) => value / divider;
/**
 * TODO: These probably need to be tweaked a lot.
 */
/**
 * @constant avoidMeetingTwicePriority The weight given to avoid players
 * meeting twice. This same weight is given to avoid matching players on each
 * other's "avoid" list. This is the highest priority. (USCF § 27A1)
 */
const avoidMeetingTwice = priority(20);
/**
 * @constant sameScoresPriority The weight given to match players with
 * equal scores. This gets divided against the difference between each players'
 * scores, plus one. For example, players with scores `1` and `3` would have
 * this priority divided by `3`. Players with scores `0` and `3` would have this
 * priority divided by `4`. Players with equal scores would divide it by `1`,
 * leaving it unchanged. (USCF § 27A2)
 */
const sameScores = divisiblePriority(16);

/**
 * @constant differentHalfPriority The weight given to match players in lower
 * versus upper halves. This is only applied to players being matched within
 * the same score group. (USCF § 27A3)
 */
const differentHalf = priority(2);
/**
 * @constant differentDueColorPriority The weight given to match players with
 * opposite due colors. (USCF § 27A4 and § 27A5)
 */
const differentDueColor = priority(1);

const maxPriority = pipe(
    add(differentHalf(true)),
    add(differentDueColor(true)),
    add(sameScores(1)),
    add(avoidMeetingTwice(true))
)(0);
export {maxPriority};

/**
 * @returns {number}
 */
export function calcPairIdeal(player1, player2) {
    PlayerStats(player1);
    PlayerStats(player2);
    if (player1.id === player2.id) {
        return 0;
    }
    const metBefore = player1.opponentHistory.includes(player2.id);
    const mustAvoid = player1.avoidList.includes(player2.id);
    return pipe(
        add(differentHalf(
            player1.upperHalf !== player2.upperHalf
            && player1.score === player2.score
        )),
        add(differentDueColor(
            player1.dueColor === null
            || player1.dueColor !== player2.dueColor
        )),
        add(sameScores(Math.abs(player1.score - player2.score) + 1)),
        add(avoidMeetingTwice(!metBefore && !mustAvoid))
    )(0);
}

/**
 * Determine which players are in the upper and lower halves of their score
 * groups.
 * This function does not sort the list. The list should be sorted first.
 */
export function setUpperHalves(playerStatsList) {
    t.list(PlayerStats)(playerStatsList);
    const splitInHalf = (list) => splitAt(list.length / 2, list);
    return playerStatsList.reduce(
        function (acc, player, ignore, src) {
            const upperHalfIds = pipe(
                filter((a) => a.score === player.score),
                splitInHalf,
                view(lensIndex(0)),
                map((a) => a.id)
            )(src);
            const isUpperHalf = upperHalfIds.includes(player.id);
            return acc.concat([assoc("upperHalf", isUpperHalf, player)]);
        },
        []
    );
}

function setByePlayer(byeQueue, playerStatsList) {
    t.list(t.Number)(byeQueue);
    t.list(PlayerStats)(playerStatsList);
    // if the list is even, just return it.
    if (playerStatsList.length % 2 === 0) {
        return playerStatsList;
    }
    const hasNotHadBye = playerStatsList.filter(
        (p) => !p.hasHadBye
    ).map((p) => p.id);
    const nextByeSignup = byeQueue.filter((id) => hasNotHadBye.includes(id))[0];
    const indexOfDueBye = (
        (nextByeSignup)
        // Assign the bye to the next person who signed up.
        ? findLastIndex((p) => p.id === nextByeSignup, playerStatsList)
        // Assign a bye to the lowest-rated player in the lowest score group.
        // Because the list is sorted, the last player is the lowest.
        // (USCF § 29L2.)
        : findLastIndex((p) => !p.hasHadBye, playerStatsList)
    );
    // In the impossible situation that *everyone* has played a bye round
    // previously, then just pick the last player.
    const index = (
        (indexOfDueBye === -1)
        ? playerStatsList.length - 1
        : indexOfDueBye
    );
    return over(
        lensIndex(index),
        assoc("isDueBye", true),
        playerStatsList
    );
}

/**
 * Sort the data so matchups default to order by score and rating.
 */
export function sortPlayersForPairing(playerStatsList) {
    t.list(PlayerStats)(playerStatsList);
    return sort(
        firstBy(
            (a, b) => b.score - a.score
        ).thenBy(
            (a, b) => b.rating - a.rating
        ),
        playerStatsList
    );
}

/**
 * Creates pairings according to the rules specified in USCF § 27, § 28,
 * and § 29. This is a work in progress and does not account for all of the
 * rules yet.
 */
export default function pairPlayers({
    playerIds,
    roundId,
    roundList,
    playerDataSource,
    avoidList,
    byeQueue
}) {
    t.list(t.Number)(playerIds);
    t.Number(roundId);
    t.list(Player)(playerDataSource);
    t.list(t.Number)(byeQueue);
    RoundList(roundList);
    AvoidList(avoidList);
    const playerStatsList = pipe(
        map((id) => (
            createPlayerStats({
                avoidList,
                id,
                playerDataSource,
                roundId,
                roundList
            })
        )),
        sortPlayersForPairing,
        setUpperHalves,
        curry(setByePlayer)(byeQueue)
    )(playerIds);
    // Turn the data into blossom-compatible input.
    const potentialMatches = playerStatsList.filter(
        (p) => !p.isDueBye
    ).reduce(
        function (acc, player1, ignore, src) {
            const playerMatches = src.map(
                (player2) => [
                    player1.id,
                    player2.id,
                    calcPairIdeal(player1, player2)
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
            // Filter out unmatched players. Blossom will automatically include
            // their missing IDs in its results.
            if (p1Id !== -1) {
                const p1 = playerStatsList.filter((p) => p.id === p1Id)[0];
                const p2 = playerStatsList.filter((p) => p.id === p2Id)[0];
                const ideal = potentialMatches.filter(
                    (pair) => pair[0] === p1Id && pair[1] === p2Id
                )[0][2];
                // Blossom returns a lot of redundant matches. Check that this
                // matchup wasn't already added.
                const matched = acc.map((pair) => pair[0]);
                if (!matched.includes(p1) && !matched.includes(p2)) {
                    return acc.concat([[p1, p2, ideal]]);
                }
            }
            return acc;
        },
        []
    );
    // Sort by net score and rating for board placement.
    const sortedResults = sort(
        firstBy((pair1, pair2) => (
            pair2[0].score + pair2[1].score - pair1[0].score - pair1[1].score
        )).thenBy((pair1, pair2) => (
            pair2[0].rating + pair2[1].rating
            - pair1[0].rating - pair1[1].rating
        )),
        reducedResults
    );
    const matches = sortedResults.map(
        function (pair) {
            const player1 = pair[0];
            const player2 = pair[1];
            const match = [player1.id, player2.id];
            if (player1.colorBalance < player2.colorBalance) {
                return reverse(match);
            }
            return match;
        }
    );
    // The bye match always gets added last so the the numbering isn't affected.
    const byePlayer = playerStatsList.filter((p) => p.isDueBye)[0];
    if (byePlayer) {
        return matches.concat([[byePlayer.id, DUMMY_ID]]);
    }
    return matches;
}
