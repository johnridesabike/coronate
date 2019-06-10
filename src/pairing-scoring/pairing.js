import {
    add,
    assoc,
    descend,
    filter,
    findLastIndex,
    last,
    lensIndex,
    map,
    // over,
    pipe,
    pluck,
    prop,
    sort,
    sortWith,
    splitAt,
    sum,
    view
} from "ramda";
import blossom from "edmonds-blossom";
import t from "tcomb";
import types from "./types";

const priority = (value) => (condition) => condition ? value : 0;
const divisiblePriority = (value) => (divider) => value / divider;

// TODO: These probably need to be tweaked a lot.

// The weight given to avoid players meeting twice. This same weight is given to
// avoid matching players on each other's "avoid" list.
// This is the highest priority. (USCF § 27A1)
const avoidMeetingTwice = priority(20);

// The weight given to match players with equal scores. This gets divided
// against the difference between each players' scores, plus one. For example,
// players with scores `1` and `3` would have this priority divided by `3`.
// Players with scores `0` and `3` would have this priority divided by `4`.
// Players with equal scores would divide it by `1`, leaving it unchanged.
// (USCF § 27A2)
const sameScores = divisiblePriority(16);

// The weight given to match players in lower versus upper halves. This is only
// applied to players being matched within the same score group. (USCF § 27A3)
const differentHalf = priority(2);

// The weight given to match players with opposite due colors.
// (USCF § 27A4 and § 27A5)
const differentDueColor = priority(1);

const maxPriority = pipe(
    add(differentHalf(true)),
    add(differentDueColor(true)),
    add(sameScores(1)),
    add(avoidMeetingTwice(true))
)(0);
export {maxPriority};

/**
 * The pairing code is broken up into several functions which take each other's
 * input to build the data necessary to pair players appropriately.
 * Using a function like Ramda's `pipe` to put them together, the final product
 * will look something like this (arguments removed for brevity):
 * ```js
 * const pairs = pipe(
 *     rounds2Matches,
 *     matches2ScoreData,
 *     createPairingData,
 *     sortDataForPairing,
 *     setUpperHalves,
 *     setByePlayer,
 *     pairPlayers // <-- the function that actually pairs them!
 * )(roundList);
 * ```
 * (This may be outdated as the actual functions aren't quite stable yet.)
 */

// Given two `PairingData` objects, this assigns a number for how much they
// should be matched. The number gets fed to the `blossom` algorithm.
export function calcPairIdeal(player1, player2) {
    if (player1.id === player2.id) {
        return 0;
    }
    const metBefore = player1.opponents.includes(player2.id);
    const mustAvoid = player1.avoidIds.includes(player2.id);
    const p1LastColor = last(player1.colors);
    const p2LastColor = last(player2.colors);
    return pipe(
        add(differentHalf(
            player1.isUpperHalf !== player2.isUpperHalf
            && player1.score === player2.score
        )),
        add(differentDueColor(
            (p1LastColor === undefined) || (p1LastColor !== p2LastColor)
        )),
        add(sameScores(Math.abs(player1.score - player2.score) + 1)),
        add(avoidMeetingTwice(!metBefore && !mustAvoid))
    )(0);
}

// Sort the data so matchups default to order by score and rating.
// TODO: I'm not sure if this should be necessary to use, but it seems to break
// the algorithm if it's removed. In the future, it may become obsolete.
export function sortDataForPairing(data) {
    return sortWith(
        [descend(prop("score")), descend(prop("rating"))],
        data
    );
}

const splitInHalf = (list) => splitAt(list.length / 2, list);

// for each object sent to this, it determines whether or not it's in the
// "upper half" of it's score group.
// (USCF § 29C1.)
function upperHalfReducer(acc, playerData, ignore, src) {
    const upperHalfIds = pipe(
        filter((p2) => p2.score === playerData.score),
        // this may be redundant if the list was already sorted.
        sort(descend(prop("rating"))),
        splitInHalf,
        view(lensIndex(0)),
        map((p) => p.id)
    )(src);
    const isUpperHalf = upperHalfIds.includes(playerData.id);
    return acc.concat([assoc("isUpperHalf", isUpperHalf, playerData)]);
}
export function setUpperHalves(data) {
    return data.reduce(upperHalfReducer, []);
}

// This this returns a tuple of two objects: The modified array of player data
// without the player assigned a bye, and the player assigned a bye.
// If no player is assigned a bye, the second object is `null`.
// After calling this, be sure to add the bye round after the non-bye'd
// players are paired.
export function setByePlayer(byeQueue, dummyId, data) {
    const hasNotHadBye2 = (p) => !p.opponents.includes(t.String(dummyId));
    // if the list is even, just return it.
    if (data.length % 2 === 0) {
        return [data, null];
    }
    const playersWithoutByes = data.filter(hasNotHadBye2).map((p) => p.id);
    const nextByeSignup = t.list(t.String)(byeQueue).filter(
        (id) => playersWithoutByes.includes(id)
    )[0];
    const indexOfDueBye = (nextByeSignup)
        // Assign the bye to the next person who signed up.
        ? findLastIndex((p) => p.id === nextByeSignup, data)
        // Assign a bye to the lowest-rated player in the lowest score group.
        // Because the list is sorted, the last player is the lowest.
        // (USCF § 29L2.)
        : findLastIndex(hasNotHadBye2, data);
    // In the impossible situation that *everyone* has played a bye round
    // previously, then just pick the last player.
    const index = (indexOfDueBye === -1)
        ? data.length - 1
        : indexOfDueBye;
    const byeData = data[index];
    const dataWithoutBye = data.filter((ignore, i) => i !== index);
    return [dataWithoutBye, byeData];
}

const netScoreDescend = (pair1, pair2) => (
    sum(pluck("score", pair2)) - sum(pluck("score", pair1))
);
const netRatingDescend = (pair1, pair2) => (
    sum(pluck("rating", pair2)) - sum(pluck("rating", pair1))
);

const PDataList = t.list(types.PairingData);

// Create pairings according to the rules specified in USCF § 27, § 28,
//  and § 29. This is a work in progress and does not account for all of the
// rules yet.
export function pairPlayers(pairingData) {
    // Because `blossom` has to use numbers that correspond to array indices,
    // we'll use `playerIdArray` as our source for that.
    const playerIdArray = PDataList(pairingData).map((p) => p.id);
    // Turn the data into blossom-compatible input.
    function pairIdealReducer(accArr, player1, index, srcArr) {
        // slice out players who have already computed, plus the current one
        const playerMatches = srcArr.slice(index + 1).map(
            (player2) => [
                playerIdArray.indexOf(player1.id),
                playerIdArray.indexOf(player2.id),
                calcPairIdeal(player1, player2)
            ]
        );
        return accArr.concat(playerMatches);
    }
    const potentialMatches = pairingData.reduce(pairIdealReducer, []);
    // Feed all of the potential matches to Edmonds-blossom and let the
    // algorithm work its magic. This returns an array where each index is the
    // ID of one player and each value is the ID of the matched player.
    const blossomResults = blossom(potentialMatches);
    // Translate those IDs into actual pairs of player Ids.
    const reducedResults = blossomResults.reduce(
        function (acc, p1Index, p2Index) {
            // Filter out unmatched players. Blossom will automatically include
            // their missing IDs in its results.
            if (p1Index !== -1) {
                // Translate the indices into ID strings
                const p1Id = playerIdArray[p1Index];
                const p2Id = playerIdArray[p2Index];
                const p1 = pairingData.filter((p) => p.id === p1Id)[0];
                const p2 = pairingData.filter((p) => p.id === p2Id)[0];

                // TODO: in the future, we may store the ideal for debugging
                // Because it rarely serves a purpose, we're not including it
                // for simplification.
                // const ideal = potentialMatches.filter(
                //     (pair) => pair[0] === p1Id && pair[1] === p2Id
                // )[0][2];

                // Blossom returns a lot of redundant matches. Check that this
                // matchup wasn't already added.
                const matched = acc.map((pair) => pair[0]);
                if (!matched.includes(p1) && !matched.includes(p2)) {
                    return acc.concat([[p1, p2]]);
                }
            }
            return acc;
        },
        []
    );
    // Sort by net score and rating for board placement.
    const sortedResults = sortWith(
        [netScoreDescend, netRatingDescend],
        reducedResults
    );
    const matches = sortedResults.map(
        function (pair) {
            const [player1, player2] = pair;
            // This is a quick-and-dirty heuristic to keep color balances
            // mostly equal. Ideally, it would also examine due colors and how
            // many times a player played each color last.
            return (sum(player1.colorScores) < sum(player2.colorScores))
                // player 1 has played as white more than player 2
                ? [player2.id, player1.id]
                // player 1 has played as black more than player 2
                // (or they're equal).
                : [player1.id, player2.id];
        }
    );
    return matches;
}
