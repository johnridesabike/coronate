import {BLACK, Id, WHITE} from "../data-types";
import {BLACKVALUE, Color, ScoreData, WHITEVALUE} from "./types";
import {
    add,
    append,
    ascend,
    assoc,
    defaultTo,
    init,
    last,
    lensPath,
    lensProp,
    over,
    pipe,
    sort,
    sum,
    tail,
    when
} from "ramda";
import {isNotDummy} from "./helpers";
import t from "tcomb";

function color2Score(color) {
    return (Color(color) === BLACK) ? BLACKVALUE : WHITEVALUE;
}

export function matches2ScoreData(matchList) {
    const data = matchList.reduce(
        function (acc, match) {
            const {playerIds, result, newRating, origRating} = match;
            const [p1Data, p2Data] = [WHITE, BLACK].map(function (color) {
                const oppColor = (color === WHITE) ? BLACK : WHITE;
                const id = playerIds[color];
                const oppId = playerIds[oppColor];
                // Get existing score data to update, or create it fresh
                // The ratings will always begin with the `origRating` of the
                // first match they were in.
                const origData = acc[id] || {id, ratings: [origRating[color]]};
                return pipe(
                    over(lensProp("results"), append(result[color])),
                    when(
                        () => isNotDummy(oppId),
                        over(lensProp("resultsNoByes"), append(result[color]))
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
        },
        {}
    );
    // TODO: remove this tcomb check for production
    return t.dict(Id, ScoreData)(data);
}

function getOpponentScores(scoreData, id) {
    const opponentIds = Object.keys(scoreData[id].opponentResults);
    return opponentIds.filter(
        isNotDummy
    ).map(
        (oppId) => getPlayerScore(scoreData, oppId)
    );
}

/*******************************************************************************
 * The main scoring methods
 ******************************************************************************/
export function getPlayerScore(scoreData, id) {
    return sum(scoreData[id].results);
}

function getCumulativeScore(scoreData, id) {
    const scoreList = scoreData[id].resultsNoByes.reduce(
        // turn the regular score list into a "running" score list
        (acc, score) => acc.concat([last(acc) + score]),
        [0]
    );
    return sum(scoreList);
}

function getCumulativeOfOpponentScore(scoreData, id) {
    const opponentIds = Object.keys(scoreData[id].opponentResults);
    const scoreList = opponentIds.filter(
        isNotDummy
    ).map(
        // TODO: properly curry this function
        (oppId) => getCumulativeScore(scoreData, oppId)
    );
    return sum(scoreList);
}

function getColorBalanceScore(scoreData, id) {
    return sum(scoreData[id].colorScores);
}

function getModifiedMedianScore(scoreData, id) {
    const scores = getOpponentScores(scoreData, id);
    t.list(t.Number)(scores);
    return pipe(
        sort(ascend),
        init,
        tail,
        sum
    )(scores);
}

function getSolkoffScore(scoreData, id) {
    return sum(getOpponentScores(scoreData, id));
}

const tieBreakMethods = {
    0: {
        func: getModifiedMedianScore,
        id: 0,
        name: "Modified median"
    },
    1: {
        func: getSolkoffScore,
        id: 1,
        name: "Solkoff"
    },
    2: {
        func: getCumulativeScore,
        id: 2,
        name: "Cumulative score"
    },
    3: {
        func: getCumulativeOfOpponentScore,
        id: 3,
        name: "Cumulative of opposition"
    },
    4: {
        func: getColorBalanceScore,
        id: 4,
        name: "Most black"
    }
};
Object.freeze(tieBreakMethods);
export {tieBreakMethods};
