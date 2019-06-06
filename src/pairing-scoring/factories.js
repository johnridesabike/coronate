import {
    BLACK,
    Id,
    RoundList,
    Standing,
    WHITE
} from "../data-types";
import {BLACKVALUE, Color, PairingData, ScoreData, WHITEVALUE} from "./types";
import {
    add,
    append,
    assoc,
    defaultTo,
    descend,
    lensIndex,
    lensPath,
    lensProp,
    over,
    path,
    pipe,
    prop,
    sortWith,
    sum
} from "ramda";
import {
    areScoresEqual,
    isNotDummyId,
    isNotDummyObj,
    rounds2Matches
} from "./helpers";
import {
    getPlayerScore,
    tieBreakMethods
} from "./scoring";
import t from "tcomb";

function color2Score(color) {
    return (Color(color) === BLACK) ? BLACKVALUE : WHITEVALUE;
}

function match2ScoreDataReducer(acc, match) {
    const {playerIds, result, newRating, origRating} = match;
    const [p1Data, p2Data] = [WHITE, BLACK].map(function (color) {
        const id = playerIds[color];
        const oppColor = (color === WHITE) ? BLACK : WHITE;
        const oppId = playerIds[oppColor];
        // Get existing score data to update, or create it fresh
        // The ratings will always begin with the `origRating` of the
        // first match they were in.
        const origData = acc[id] || {id, ratings: [origRating[color]]};
        return pipe(
            over(lensProp("results"), append(result[color])),
            over(
                lensProp("resultsNoByes"),
                (isNotDummyId(oppId)) ? append(result[color]) : defaultTo([])
            ),
            over(lensProp("colors"), append(color)),
            over(lensProp("colorScores"), append(color2Score(color))),
            over(
                lensPath(["opponentResults", oppId]),
                pipe(defaultTo(0), add(result[color]))
            ),
            over(lensProp("ratings"), append(newRating[color]))
        )(origData);
    });
    return pipe(
        assoc(p1Data.id, p1Data),
        assoc(p2Data.id, p2Data)
    )(acc);
}

export function matches2ScoreData(matchList) {
    const data = matchList.reduce(match2ScoreDataReducer, {});
    // TODO: remove this tcomb check for production
    return t.dict(Id, ScoreData)(data);
}

const emptyScoreData = (id) => ScoreData({
    colorScores: [],
    colors: [],
    id,
    opponentResults: {},
    ratings: [],
    results: [],
    resultsNoByes: []
});
export {emptyScoreData};

export function avoidPairReducer(acc, pair) {
    return pipe(
        over(lensProp(pair[0]), append(pair[1])),
        over(lensProp(pair[1]), append(pair[0]))
    )(acc);
}

export function createPairingData(playerData, avoidPairs, scoreData) {
    const avoidDict = avoidPairs.reduce(avoidPairReducer, {});
    const pairingData = Object.values(playerData).reduce(
        function pairingDataReducer(acc, data) {
            // If there's no scoreData for a player, use empty values
            const playerStats = (scoreData[data.id])
                ? scoreData[data.id]
                : {
                    colorScores: [],
                    colors: [],
                    opponentResults: {},
                    results: []
                };
            // `isUpperHalf` and `isDueBye` default to `false` and will have to be
            // set by another function later.
            const pairData = {
                avoidIds: avoidDict[data.id] || [],
                colorScores: playerStats.colorScores,
                colors: playerStats.colors,
                id: data.id,
                isDueBye: false,
                isUpperHalf: false,
                opponents: Object.keys(playerStats.opponentResults),
                rating: data.rating,
                // `score` is calculated and cached here because the blossom
                // pairing will reuse it many times.
                score: sum(playerStats.results)
            };
            return acc.concat([pairData]);
        },
        []
    );
    // TODO: remove this tcomb check for production
    return t.list(PairingData)(pairingData);
}

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
    const standingsFlatNoByes = standingsFlat.filter(isNotDummyObj);
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
