// This implements the tiebreak methods specified in USCF § 34E.
// This is incomplete; many more tiebreak methods need to be added. These are
// the most commonly used.
import {
    ascend,
    init,
    last,
    pipe,
    sort,
    sum,
    tail
} from "ramda";
// import t from "tcomb";
import types from "./types";

const isNotDummy = (scoreData) => (oppId) => !scoreData[oppId].isDummy;

function getPlayerScore(scoreData, id) {
    return sum(scoreData[id].results);
}
export {getPlayerScore};

// Don't mind me, just a helper function
function getOpponentScores(scoreData, id) {
    const opponentIds = Object.keys(scoreData[id].opponentResults);
    const getScore = (oppId) => getPlayerScore(scoreData, oppId);
    return opponentIds.filter(isNotDummy(scoreData)).map(getScore);
}

// USCF § 34E1.
function getMedianScore(scoreData, id) {
    const scores = getOpponentScores(scoreData, id);
    return pipe(sort(ascend), init, tail, sum)(scores);
}

// USCF § 34E2.
function getSolkoffScore(scoreData, id) {
    return sum(getOpponentScores(scoreData, id));
}

// turn the regular score list into a "running" score list
const runningReducer = (acc, score) => acc.concat([last(acc) + score]);

// USCF § 34E3.
function getCumulativeScore(scoreData, id) {
    const scoreList = scoreData[id].resultsNoByes.reduce(runningReducer, [0]);
    return sum(scoreList);
}

// USCF § 34E4.
function getCumulativeOfOpponentScore(scoreData, id) {
    const oppIds = Object.keys(scoreData[id].opponentResults);
    const getCumScore = (oppId) => getCumulativeScore(scoreData, oppId);
    const scoreList = oppIds.filter(isNotDummy(scoreData)).map(getCumScore);
    return sum(scoreList);
}

// USCF § 34E6
function getColorBalanceScore(scoreData, id) {
    return sum(scoreData[id].colorScores);
};

const tieBreakMethods = {
    0: {
        func: types.ScoreCalculator.of(getMedianScore),
        id: 0,
        name: "Median"
    },
    1: {
        func: types.ScoreCalculator.of(getSolkoffScore),
        id: 1,
        name: "Solkoff"
    },
    2: {
        func: types.ScoreCalculator.of(getCumulativeScore),
        id: 2,
        name: "Cumulative score"
    },
    3: {
        func: types.ScoreCalculator.of(getCumulativeOfOpponentScore),
        id: 3,
        name: "Cumulative of opposition"
    },
    4: {
        func: types.ScoreCalculator.of(getColorBalanceScore),
        id: 4,
        name: "Most black"
    }
};
Object.freeze(tieBreakMethods);
export {tieBreakMethods};

const getNameFromIndex = (index) => tieBreakMethods[index].name;
// Returns the names of the tiebreak methods selected for your tournament.
const getTieBreakNames = (idList) => idList.map(getNameFromIndex);
export {getTieBreakNames};
