
import {
    ascend,
    init,
    last,
    pipe,
    sort,
    sum,
    tail
} from "ramda";
import {isNotDummyId} from "./helpers";
import t from "tcomb";

function getOpponentScores(scoreData, id) {
    const opponentIds = Object.keys(scoreData[id].opponentResults);
    return opponentIds.filter(
        isNotDummyId
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
        isNotDummyId
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
