// This implements the tiebreak methods specified in USCF § 34E.
// This is incomplete; many more tiebreak methods need to be added. These are
// simply the most commonly used.
import {
    ascend,
    init,
    last,
    pipe,
    sort,
    sum,
    tail
} from "ramda";
import t from "tcomb";
import types from "./types";

function getOpponentScores(scoreData, id) {
    const opponentIds = Object.keys(scoreData[id].opponentResults);
    return opponentIds.filter(
        (oppId) => !scoreData[oppId].isDummy
    ).map(
        (oppId) => getPlayerScore(scoreData, oppId)
    );
}

/*******************************************************************************
 * The main scoring methods
 ******************************************************************************/
function getPlayerScore(scoreData, id) {
    return sum(scoreData[id].results);
}
export {getPlayerScore};


// USCF § 34E1.
function getModifiedMedianScore(scoreData, id) {
    const scores = getOpponentScores(scoreData, id);
    return pipe(
        sort(ascend),
        init,
        tail,
        sum
    )(scores);
}

// USCF § 34E2.
function getSolkoffScore(scoreData, id) {
    return sum(getOpponentScores(scoreData, id));
}
// USCF § 34E3.
function getCumulativeScore(scoreData, id) {
    // turn the regular score list into a "running" score list
    const scoreList = scoreData[id].resultsNoByes.reduce(
        (acc, score) => acc.concat([last(acc) + score]),
        [0]
    );
    return sum(scoreList);
}

// USCF § 34E9.
function getCumulativeOfOpponentScore(scoreData, id) {
    const opponentIds = Object.keys(scoreData[id].opponentResults);
    const scoreList = opponentIds.filter(
        (oppId) => !scoreData[oppId].isDummy
    ).map(
        (oppId) => getCumulativeScore(scoreData, oppId)
    );
    return sum(scoreList);
}

function getColorBalanceScore(scoreData, id) {
    return sum(scoreData[id].colorScores);
};

const {ScoreCalculator} = types;
const tieBreakMethods = {
    0: {
        func: ScoreCalculator.of(getModifiedMedianScore),
        id: 0,
        name: "Modified median"
    },
    1: {
        func: ScoreCalculator.of(getSolkoffScore),
        id: 1,
        name: "Solkoff"
    },
    2: {
        func: ScoreCalculator.of(getCumulativeScore),
        id: 2,
        name: "Cumulative score"
    },
    3: {
        func: ScoreCalculator.of(getCumulativeOfOpponentScore),
        id: 3,
        name: "Cumulative of opposition"
    },
    4: {
        func: ScoreCalculator.of(getColorBalanceScore),
        id: 4,
        name: "Most black"
    }
};
Object.freeze(tieBreakMethods);
export {tieBreakMethods};

// Returns the names of the tiebreak methods selected for your tournament.
const getTieBreakNames = (idList) => (
    t.list(t.Number)(idList).map((i) => tieBreakMethods[i].name)
);
export {getTieBreakNames};
