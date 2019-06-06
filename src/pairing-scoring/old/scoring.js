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
    getMatchesByPlayerNoByes,
    getPlayerScoreList,
    getPlayerScoreListNoByes,
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

export function hasHadBye(playerId, matchList) {
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
    function _getPlayerScore(playerId, matchList) {
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
        const colorList = getMatchesByPlayerNoByes(
            playerId,
            matchList
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
