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
    getPlayerScore,
    tieBreakMethods
} from "./scoring";
import t from "tcomb";
import types from "./types";

// This is useful for cases where the regular factory functions return empty
// results because a player hasn't been added yet.
const createBlankScoreData = (id) => types.ScoreData({
    colorScores: [],
    colors: [],
    halfPos: 0,
    id,
    isDummy: false,
    opponentResults: {},
    ratings: [],
    results: [],
    resultsNoByes: []
});
export {createBlankScoreData};

// Sort the standings by score, see USCF tie-break rules from § 34.
// Returns the list of the standings. Each standing has a `tieBreaks` property
// which lists the score associated with each method. The order of these
// coresponds to the order of the method names in the second list.
export function createStandingList(methods, scoreData) {
    const selectedTieBreaks = methods.map((i) => tieBreakMethods[i]);
    // Get a flat list of all of the players and their scores.
    const standings = Object.keys(scoreData).map(
        (id) => types.Standing({
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
    return standingsSorted;
}

function areScoresEqual(standing1, standing2) {
    // Check if any of them aren't equal
    if (standing1.score !== standing2.score) {
        return false;
    }
    // Check if any tie-break values are not equal
    return !(
        standing1.tieBreaks.reduce(
            (acc, value, i) => acc.concat(value !== standing2.tieBreaks[i]),
            []
        ).includes(true)
    );
}

// Groups the standings by score, see USCF tie-break rules from § 34.
// example: `[[Dale, Audrey], [Pete], [Bob]]` Dale and Audrey are tied for
// first, Pete is 2nd, Bob is 3rd.
export function createStandingTree(standingList) {
    const standingsTree = t.list(types.Standing)(standingList).reduce(
        function assignStandingsToTree(acc, standing, i, orig) {
            const prevStanding = orig[i - 1];
            // Always make a new rank for the first player
            const isNewRank = (
                i === 0
                ? true
                // Make a new rank if the scores aren't equal
                : !areScoresEqual(standing, prevStanding)
            );
            return (
                isNewRank
                // If this player doesn't have the same score, create a new
                // branch of the tree
                ? acc.concat([[standing]])
                // If this player has the same score as the last, append it
                // to the last branch
                : over(lensIndex(acc.length - 1), append(standing), acc)
            );
        },
        []
    );
    return standingsTree;
}
