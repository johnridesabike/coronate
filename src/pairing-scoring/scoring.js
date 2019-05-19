// TODO: Clean this up. Refactor unnecessary functions, etc.
import {
    add,
    append,
    defaultTo,
    last,
    lensIndex,
    lensProp,
    over,
    pipe,
    sort,
    sum
} from "ramda";
import {firstBy} from "thenby";
import EloRank from "elo-rank";
import t from "tcomb";
// eslint-disable-next-line no-unused-vars
import {WHITE, BLACK, DUMMY_ID} from "./constants";
import {Player, RoundList} from "../factories";
import {
    isNotBye,
    getMatchesByPlayer,
    playerScoreList,
    removeFirstAndLast,
    isNotDummy,
    getAllPlayers,
    areScoresEqual,
    playerMatchColor,
    switchColor,
    getPlayerById,
    getPlayerAvoidList,
    ScoreCalculator
} from "./helpers";

const Standing = t.struct({
    id: t.Number,
    score: t.Number,
    tieBreaks: t.list(t.Number)
});

/**
 * Create a function to sort the players. This dynamically creates a `thenBy`
 * function based on the desired tiebreak sort methods.
 * @param {typeof tieBreakMethods} tieBreaks
 */
function createTieBreakSorter(tieBreaks) {
    return tieBreaks.reduce(
        (acc, ignore, index) => (
            acc.thenBy((standing) => standing.tieBreaks[index], -1)
        ),
        firstBy((standing) => standing.score, -1)
    );
}

/**
 * TODO: Maybe merge this with the other function?
 */
/**
 * @returns {number[]}
 */
const playerScoreListNoByes = ScoreCalculator.of(
    function (playerId, roundList, roundId = null) {
        return getMatchesByPlayer(
            playerId,
            roundList,
            roundId
        ).filter(
            isNotBye
        ).map(
            (match) => match.result[match.players.indexOf(playerId)]
        );
    }
);

/**
 * @returns {boolean}
 */
const hasHadBye = ScoreCalculator.of(
    function (playerId, roundList, roundId = null) {
        return getMatchesByPlayer(
            playerId,
            roundList,
            roundId
        ).reduce(
            (acc, match) => acc.concat(match.players),
            []
        ).includes(DUMMY_ID);
    }
);
export {hasHadBye};

/**
 * @returns {number[]}
 */
const getPlayersByOpponent = ScoreCalculator.of(
    function (opponentId, roundList, roundId = null) {
        return getMatchesByPlayer(
            opponentId,
            roundList,
            roundId
        ).reduce(
            (acc, match) => acc.concat(match.players),
            []
        ).filter(
            (playerId) => playerId !== opponentId
        );
    }
);

/**
 * @returns {number}
 */
const playerScore = ScoreCalculator.of(
    function (playerId, roundList, roundId = null) {
        const scoreList = playerScoreList(playerId, roundList, roundId);
        return sum(scoreList);
    }
);

/**
 * The player's cumulative score.
 * @returns {number}
 */
const playerScoreCum = ScoreCalculator.of(
    function (playerId, roundList, roundId = null) {
        const scoreList = playerScoreListNoByes(
            playerId,
            roundList,
            roundId
        ).reduce( // turn the regular score list into a "running" score list
            (acc, score) => acc.concat([last(acc) + score]),
            [0]
        );
        return sum(scoreList);
    }
);

/**
 * Calculate a player's color balance. A negative number means they played as
 * white more. A positive number means they played as black more.
 * @returns {number}
 */
const playerColorBalance = ScoreCalculator.of(
    function (playerId, roundList, roundId = null) {
        const colorList = getMatchesByPlayer(
            playerId,
            roundList,
            roundId
        ).filter(
            isNotBye
        ).reduce(
            (acc, match) => (
                (match.players[WHITE] === playerId)
                ? acc.concat(-1) // White = -1
                : acc.concat(1) // Black = +1
            ),
            [0]
        );
        return sum(colorList);
    }
);

/**
 * Used for `modifiedMedian` and `solkoff`.
 * @returns {number[]}
 */
const opponentScores = ScoreCalculator.of(
    function (pId, roundList, roundId) {
        const scores = getPlayersByOpponent(
            pId,
            roundList,
            roundId
        ).filter(
            isNotDummy
        ).map(
            (opponent) => playerScore(opponent, roundList, roundId)
        );
        return sort((a, b) => a - b, scores);
    }
);

/**
 * Gets the modified median factor defined in USCF § 34E1
 * @returns {number}
 */
const modifiedMedian = ScoreCalculator.of(
    function (playerId, roundList, roundId = null) {
        const scores = opponentScores(playerId, roundList, roundId);
        const scoresMinusFirstAndLast = removeFirstAndLast(scores);
        return sum(scoresMinusFirstAndLast);
    }
);

/**
 * @returns {number}
 */
const solkoff = ScoreCalculator.of(
    function (playerId, roundList, roundId = null) {
        const scoreList = opponentScores(playerId, roundList, roundId);
        return sum(scoreList);
    }
);

/**
 * Get the cumulative scores of a player's opponents.
 * @returns {number}
 */
const playerOppScoreCum = ScoreCalculator.of(
    function (playerId, roundList, roundId = null) {
        const oppScores = getPlayersByOpponent(
            playerId,
            roundList,
            roundId
        ).filter(
            isNotDummy
        ).map(
            (p) => playerScoreCum(p, roundList, roundId)
        );
        return sum(oppScores);
    }
);

const tieBreakMethods = [
    {
        name: "Modified median",
        func: modifiedMedian
    },
    {
        name: "Solkoff",
        func: solkoff
    },
    {
        name: "Cumulative score",
        func: playerScoreCum
    },
    {
        name: "Cumulative of opposition",
        func: playerOppScoreCum
    },
    {
        name: "Most black",
        func: playerColorBalance
    }
];
Object.freeze(tieBreakMethods);
export {tieBreakMethods};

/**
 * Sort the standings by score, see USCF tie-break rules from § 34.
 * @returns {[typeof Standing[], string[]]} The standings and the list of method used
 */
export function createStandingList(methods, roundList, roundId) {
    t.assert(t.list(t.Number).is(methods));
    t.assert(t.list(t.Array).is(roundList));
    t.assert(t.maybe(t.Number).is(roundId));
    const selectedTieBreaks = methods.map((i) => tieBreakMethods[i]);
    const tieBreakNames = selectedTieBreaks.map((m) => m.name);
    // Get a flat list of all of the players and their scores.
    const standings = getAllPlayers(
        roundList
    ).filter(
        (id) => id !== DUMMY_ID
    ).map(
        (id) => (Standing({
            id,
            score: playerScore(id, roundList, roundId),
            tieBreaks: selectedTieBreaks.map(
                (method) => method.func(id, roundList, roundId)
            )
        }))
    );
    const sortFunc = createTieBreakSorter(selectedTieBreaks);
    const standingsSorted = sort(sortFunc, standings);
    return [standingsSorted, tieBreakNames];
}

/**
 * Sort the standings by score, see USCF tie-break rules from § 34.
 * example: `[[Dale, Audrey], [Pete], [Bob]]`
 * Dale and Audrey are tied for first, Pete is 2nd, Bob is 3rd.
 * @returns {[Standing[][], string[]]} The standings and the list of method used
 */
export function createStandingTree(methods, roundList, roundId = null) {
    t.assert(t.list(t.Number).is(methods));
    t.assert(RoundList.is(roundList));
    t.assert(t.maybe(t.Number).is(roundId));
    const [
        standingsFlat,
        tieBreakNames
    ] = createStandingList(methods, roundList, roundId);
    const standingsTree = standingsFlat.reduce(
        /** @param {Standing[][]} acc*/
        function (acc, standing, i, orig) {
            const prevStanding = orig[i - 1];
            const isNewRank = (
                (i === 0)
                ? true // Always make a new rank for the first player
                : !areScoresEqual(standing, prevStanding)
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

/**
 * @returns {typeof WHITE | typeof BLACK?}
 */
const dueColor = ScoreCalculator.of(
    function (playerId, roundList, roundId = null) {
        const match = (
            (roundId === null)
            ? last(roundList)
            : roundList[roundId - 1]
        );
        if (!match) {
            return null;
        }
        const prevColor = playerMatchColor(playerId, match);
        return switchColor(prevColor);
    }
);

const PlayerStats = t.interface({
    profile: Player,
    id: t.Number,
    score: t.Number,
    dueColor: t.maybe(t.Number),
    colorBalance: t.Number,
    opponentHistory: t.list(t.Number),
    upperHalf: t.Boolean,
    rating: t.Number,
    avoidList: t.list(t.Number),
    hasHadBye: t.Boolean,
    isDueBye: t.Boolean
});
export {PlayerStats};

/**
 * @returns {PlayerStats}
 */
export function createPlayerStats(
    playerId,
    playerList,
    avoidList,
    roundList,
    roundId
) {
    const player = getPlayerById(playerList, playerId);
    return PlayerStats({
        profile: player,
        rating: player.rating, // is this shortcut necessary?
        id: playerId, // is this shortcut necessary?
        score: playerScore(playerId, roundList, roundId),
        dueColor: dueColor(playerId, roundList, roundId),
        colorBalance: playerColorBalance(playerId, roundList, roundId),
        opponentHistory: getPlayersByOpponent(playerId, roundList, roundId),
        upperHalf: false,
        avoidList: getPlayerAvoidList(playerId, avoidList),
        hasHadBye: hasHadBye(playerId, roundList, roundId),
        isDueBye: false
    });
}

/**
 * @returns {Object.<string, number>} {opponentId: result}
 */
const getResultsByOpponent = ScoreCalculator.of(
    function (playerId, roundList, roundId = null) {
        const matches = getMatchesByPlayer(playerId, roundList, roundId);
        return matches.reduce(
            function (acc, match) {
                const opponent = match.players.filter(
                    (id) => id !== playerId
                )[0];
                const color = match.players.indexOf(playerId);
                const result = match.result[color];
                // This sets a default result of 0 and then adds the existing
                // result. Most of the time, this would be the same as using
                // `set()` with the result, but if two players play each other
                // multiple times then the total results will be displayed.
                return over(
                    lensProp(String(opponent)),
                    pipe(defaultTo(0), add(result)),
                    acc
                );
            },
            {}
        );
    }
);
export {getResultsByOpponent};

const getPerformanceRatings = ScoreCalculator.of(
    function (playerId, roundList, roundId = null) {
        const matches = getMatchesByPlayer(playerId, roundList, roundId);
        // TODO: This could be Don't-Repeat-Yourself'd a bit
        const firstMatch = matches[0];
        const firstColor = firstMatch.players.indexOf(playerId);
        const firstRating = firstMatch.origRating[firstColor];
        const lastMatch = last(matches);
        const lastColor = lastMatch.players.indexOf(playerId);
        const lastRating = lastMatch.newRating[lastColor];
        return [firstRating, lastRating];
    }
);
export {getPerformanceRatings};

export function kFactor(matchCount) {
    t.Number(matchCount);
    const ne = matchCount || 1;
    return (800 / ne);
}

/**
 * @param {[number, number]} origRatings
 * @param {[number, number]} matchCounts
 * @param {[number, number]} result
 * @returns {[number, number]}
 */
export function calcNewRatings(origRatings, matchCounts, result) {
    const whiteElo = new EloRank(kFactor(matchCounts[WHITE]));
    const blackElo = new EloRank(kFactor(matchCounts[BLACK]));
    const FLOOR = 100;
    const scoreExpected = [
        whiteElo.getExpected(origRatings[WHITE], origRatings[BLACK]),
        blackElo.getExpected(origRatings[BLACK], origRatings[WHITE])
    ];
    /** @type {[number, number]} */
    const newRating = [
        whiteElo.updateRating(
            scoreExpected[WHITE],
            result[WHITE],
            origRatings[WHITE]
        ),
        blackElo.updateRating(
            scoreExpected[BLACK],
            result[BLACK],
            origRatings[BLACK]
        )
    ];
    // @ts-ignore
    return newRating.map(
        (rating) => (
            rating < FLOOR
            ? FLOOR
            : rating
        )
    );
}
