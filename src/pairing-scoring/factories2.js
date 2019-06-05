import {
    Id,
    RoundList,
    Standing
} from "../data-types";
import {
    append,
    descend,
    lensIndex,
    over,
    path,
    prop,
    sortWith
} from "ramda";
import {
    areScoresEqual,
    isNotDummy,
    rounds2Matches
} from "./helpers";
import {
    getPlayerScore,
    matches2ScoreData,
    tieBreakMethods
} from "./scoring2";
import {ScoreData} from "./types";
import t from "tcomb";
/**
 * Sort the standings by score, see USCF tie-break rules from § 34.
 * TODO: this needs performance improvements.
 * @returns {[Standing[], string[]]} The the list of the standings and a list
 * of the methods used. Each standing has a `tieBreaks` property which lists the
 * score associated with each method. The order of these coresponds to the order
 * of the method names in the second list.
 */
export function createStandingList(scoreData, methods) {
    t.dict(Id, ScoreData)(scoreData);
    t.list(t.Number)(methods);
    // const scoreData = matches2ScoreData(rounds2Matches(roundList, roundId));
    const selectedTieBreaks = methods.map((i) => tieBreakMethods[i]);
    const tieBreakNames = selectedTieBreaks.map((m) => m.name);
    // Get a flat list of all of the players and their scores.
    const standings = Object.keys(scoreData).map(
        (id) => Standing({
            id,
            score: getPlayerScore(scoreData, id),
            tieBreaks: selectedTieBreaks.map(({func}) => func(scoreData, id))
        })
    );
    // create a list of functions to pass to `sortWith`. This will sort by
    // scores and then by each tiebreak value.
    const sortFuncList = Object.keys(selectedTieBreaks).reduce(
        (acc, key) => acc.concat([descend(path(["tieBreaks", key]))]),
        [descend(prop("score"))]
    );
    const standingsSorted = sortWith(sortFuncList, standings);
    return [standingsSorted, tieBreakNames];
}

/**
 * Sort the standings by score, see USCF tie-break rules from § 34.
 * example: `[[Dale, Audrey], [Pete], [Bob]]`
 * Dale and Audrey are tied for first, Pete is 2nd, Bob is 3rd.
 * @returns {[Standing[][], string[]]} The standings and the list of method used
 */
export function createStandingTree(methods, roundList, roundId = null) {
    t.list(t.Number)(methods);
    RoundList(roundList);
    t.maybe(t.Number)(roundId);
    const scoreData = matches2ScoreData(rounds2Matches(roundList, roundId));
    const [
        standingsFlat,
        tieBreakNames
    ] = createStandingList(scoreData, methods);
    const standingsFlatNoByes = standingsFlat.filter(isNotDummy);
    const standingsTree = standingsFlatNoByes.reduce(
        /** @param {Standing[][]} acc*/
        function assignStandingsToTree(acc, standing, i, orig) {
            const prevStanding = orig[i - 1];
            const isNewRank = (
                // Always make a new rank for the first player
                (i === 0) ? true : !areScoresEqual(standing, prevStanding)
            );
            if (isNewRank) {
                return append([standing], acc);
            }
            // If this player has the same score as the last, list them together
            return over(lensIndex(acc.length - 1), append(standing), acc);
        },
        []
    );
    return [standingsTree, tieBreakNames];
}
