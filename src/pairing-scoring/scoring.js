// TODO: Clean this up. Refactor unnecessary functions, etc.
import {
    BLACK,
    DUMMY_ID,
    Id,
    Match,
    ScoreCalulator,
    WHITE
} from "../data-types";
import {
    getMatchDetailsForPlayer,
    getMatchesByPlayer,
    getPlayerScoreList,
    getPlayerScoreListNoByes,
    isNotBye,
    isNotDummy
} from "./helpers";
import {
    init,
    last,
    pipe,
    sort,
    sum,
    tail
} from "ramda";
import {firstBy} from "thenby";
import t from "tcomb";

export function getDueColor(playerId, matchList) {
    Id(playerId);
    t.list(Match)(matchList);
    const lastMatch = last(getMatchesByPlayer(playerId, matchList));
    if (!lastMatch) {
        return null;
    }
    const {color} = getMatchDetailsForPlayer(playerId, lastMatch);
    return (color === WHITE) ? BLACK : WHITE;
}

/**
 * @returns {boolean}
 */
function hasHadBye(playerId, matchList) {
    Id(playerId);
    t.list(Match)(matchList);
    return getMatchesByPlayer(
        playerId,
        matchList
    ).reduce(
        (acc, match) => acc.concat(match.playerIds),
        []
    ).includes(DUMMY_ID);
}
export {hasHadBye};

/**
 * @returns {number[]}
 */
export function getPlayersByOpponent(opponentId, matchList) {
    Id(opponentId);
    t.list(Match)(matchList);
    return getMatchesByPlayer(
        opponentId,
        matchList
    ).reduce(
        (acc, match) => acc.concat(match.playerIds),
        []
    ).filter(
        (playerId) => playerId !== opponentId
    );
}

/**
 * Used for `modifiedMedian` and `solkoff`.
 * @returns {number[]}
 */
function getOpponentScores(playerId, matchList) {
    Id(playerId);
    t.list(Match)(matchList);
    const scores = getPlayersByOpponent(
        playerId,
        matchList
    ).filter(
        isNotDummy
    ).map(
        (opponent) => getPlayerScore(opponent, matchList)
    );
    return scores;
}

/*******************************************************************************
 * The main scoring methods
 ******************************************************************************/
const getPlayerScore = ScoreCalulator.of(
    // named functions are better for debugging
    function playerScoreFunction(playerId, matchList) {
        const scoreList = getPlayerScoreList(playerId, matchList);
        return sum(scoreList);
    }
);
export {getPlayerScore};

/**
 * The player's cumulative score.
 */
const getCumulativeScore = ScoreCalulator.of(
    // named functions are better for debugging
    function _getCumulativeScore(playerId, matchList) {
        const scoreList = getPlayerScoreListNoByes(
            playerId,
            matchList
        ).reduce( // turn the regular score list into a "running" score list
            (acc, score) => acc.concat([last(acc) + score]),
            [0]
        );
        return sum(scoreList);
    }
);

/**
 * Get the cumulative scores of a player's opponents.
 */
const getCumulativeOfOpponentScore = ScoreCalulator.of(
    // named functions are better for debugging
    function _getCumulativeOfOpponentScore(playerId, matchList) {
        const oppScores = getPlayersByOpponent(
            playerId,
            matchList
        ).filter(
            isNotDummy
        ).map(
            (id) => getCumulativeScore(id, matchList)
        );
        return sum(oppScores);
    }
);

/**
 * Calculate a player's color balance. A negative number means they played as
 * white more. A positive number means they played as black more.
 */
const getColorBalanceScore = ScoreCalulator.of(
    // named functions are better for debugging
    function _getColorBalanceScore(playerId, matchList) {
        const colorList = getMatchesByPlayer(
            playerId,
            matchList
        ).filter(
            isNotBye
        ).reduce(
            (acc, match) => (
                (match.playerIds[WHITE] === playerId)
                ? acc.concat(-1) // White = -1
                : acc.concat(1) // Black = +1
            ),
            [0]
        );
        return sum(colorList);
    }
);
export {getColorBalanceScore};

/**
 * Gets the modified median factor defined in USCF § 34E1
 */
const getModifiedMedianScore = ScoreCalulator.of(
    // named functions are better for debugging
    function _getModifiedMedianScore(playerId, matchList) {
        const scores = getOpponentScores(playerId, matchList);
        return pipe(
            sort((a, b) => a - b),
            init,
            tail,
            sum
        )(scores);
    }
);

const getSolkoffScore = ScoreCalulator.of(
    // named functions are better for debugging
    function _getSolkoffScore(playerId, matchList) {
        const scoreList = getOpponentScores(playerId, matchList);
        return sum(scoreList);
    }
);

const tieBreakMethods = [
    {
        func: getModifiedMedianScore,
        name: "Modified median"
    },
    {
        func: getSolkoffScore,
        name: "Solkoff"
    },
    {
        func: getCumulativeScore,
        name: "Cumulative score"
    },
    {
        func: getCumulativeOfOpponentScore,
        name: "Cumulative of opposition"
    },
    {
        func: getColorBalanceScore,
        name: "Most black"
    }
];
Object.freeze(tieBreakMethods);
export {tieBreakMethods};

/**
 * Create a function to sort the standings. This dynamically creates a `thenBy`
 * function based on the desired tiebreak sort methods.
 * @returns A function to be used with a list of standings and `sort()`.
 */
export function createTieBreakSorter(tieBreaks) {
    return tieBreaks.reduce(
        (acc, ignore, index) => (
            acc.thenBy(
                (standing1, standing2) => (
                    standing2.tieBreaks[index] - standing1.tieBreaks[index]
                )
            )
        ),
        firstBy((standing1, standing2) => standing2.score - standing1.score)
    );
}
