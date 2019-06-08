
import {
    ascend,
    init,
    last,
    pipe,
    sort,
    sum,
    tail
} from "ramda";
import {ScoreCalculator} from "./types";
import {isNotDummyId} from "../data-types";
import t from "tcomb";

// I don't like how this has to import `isNotDummyId` from `data-types`, since
// I would prefer that this module be 100% independent of non-score related
// types. Perhaps the filter can be passed as a callback? Would that make
// this too complex?
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
const getPlayerScore = ScoreCalculator.of(
    function _getPlayerScore(scoreData, id) {
        return sum(scoreData[id].results);
    }
);
export {getPlayerScore};

const getCumulativeScore = ScoreCalculator.of(
    function _getCumulativeScore(scoreData, id) {
        const scoreList = scoreData[id].resultsNoByes.reduce(
            // turn the regular score list into a "running" score list
            (acc, score) => acc.concat([last(acc) + score]),
            [0]
        );
        return sum(scoreList);
    }
);

const getCumulativeOfOpponentScore = ScoreCalculator.of(
    function _getCumulativeOfOpponentScore(scoreData, id) {
        const opponentIds = Object.keys(scoreData[id].opponentResults);
        const scoreList = opponentIds.filter(
            isNotDummyId
        ).map(
            // TODO: properly curry this function
            (oppId) => getCumulativeScore(scoreData, oppId)
        );
        return sum(scoreList);
    }
);

const getColorBalanceScore = ScoreCalculator.of(
    function getColorBalanceScore(scoreData, id) {
        return sum(scoreData[id].colorScores);
    }
);

const getModifiedMedianScore = ScoreCalculator.of(
    function getModifiedMedianScore(scoreData, id) {
        const scores = getOpponentScores(scoreData, id);
        return pipe(
            sort(ascend),
            init,
            tail,
            sum
        )(scores);
    }
);

const getSolkoffScore = ScoreCalculator.of(
    function getSolkoffScore(scoreData, id) {
        return sum(getOpponentScores(scoreData, id));
    }
);

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

// Returns the names of the tiebreak methods selected for your tournament.
const getTieBreakNames = (idList) => (
    t.list(t.Number)(idList).map((i) => tieBreakMethods[i].name)
);
export {getTieBreakNames};
