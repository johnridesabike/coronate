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
import {
    AvoidList,
    BLACK,
    DUMMY_ID,
    Match,
    Player,
    RoundList,
    WHITE
} from "../data-types";
import {
    Standing,
    areScoresEqual,
    getAllPlayersFromMatches,
    getMatchesByPlayer,
    getPlayerAvoidList,
    getPlayerById,
    isNotBye,
    isNotDummy,
    playerScoreList,
    removeFirstAndLast,
    rounds2Matches
} from "./helpers";

/**
 * Create a function to sort the players. This dynamically creates a `thenBy`
 * function based on the desired tiebreak sort methods.
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
function playerScoreListNoByes(playerId, matchList) {
    return getMatchesByPlayer(
        playerId,
        matchList
    ).filter(
        isNotBye
    ).map(
        (match) => match.result[match.players.indexOf(playerId)]
    );
}

/**
 * @returns {boolean}
 */
function hasHadBye(playerId, matchList) {
    t.Number(playerId);
    t.list(Match)(matchList);
    return getMatchesByPlayer(
        playerId,
        matchList
    ).reduce(
        (acc, match) => acc.concat(match.players),
        []
    ).includes(DUMMY_ID);
}
export {hasHadBye};

/**
 * @returns {number[]}
 */
function getPlayersByOpponent(opponentId, matchList) {
    t.Number(opponentId);
    t.list(Match)(matchList);
    return getMatchesByPlayer(
        opponentId,
        matchList
    ).reduce(
        (acc, match) => acc.concat(match.players),
        []
    ).filter(
        (playerId) => playerId !== opponentId
    );
}

/**
 * @returns {number}
 */
function playerScore(playerId, matchList) {
    t.Number(playerId);
    t.list(Match)(matchList);
    const scoreList = playerScoreList(playerId, matchList);
    return sum(scoreList);
}

/**
 * The player's cumulative score.
 * @returns {number}
 */
function playerScoreCum(playerId, matchList) {
    t.Number(playerId);
    t.list(Match)(matchList);
    const scoreList = playerScoreListNoByes(
        playerId,
        matchList
    ).reduce( // turn the regular score list into a "running" score list
        (acc, score) => acc.concat([last(acc) + score]),
        [0]
    );
    return sum(scoreList);
}

/**
 * Calculate a player's color balance. A negative number means they played as
 * white more. A positive number means they played as black more.
 * @returns {number}
 */
function playerColorBalance(playerId, matchList) {
    t.Number(playerId);
    t.list(Match)(matchList);
    const colorList = getMatchesByPlayer(
        playerId,
        matchList
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

/**
 * Used for `modifiedMedian` and `solkoff`.
 * @returns {number[]}
 */
function opponentScores(pId, matchList) {
    t.Number(pId);
    t.list(Match)(matchList);
    const scores = getPlayersByOpponent(
        pId,
        matchList
    ).filter(
        isNotDummy
    ).map(
        (opponent) => playerScore(opponent, matchList)
    );
    return sort((a, b) => a - b, scores);
}

/**
 * Gets the modified median factor defined in USCF § 34E1
 * @returns {number}
 */
function modifiedMedian(playerId, matchList) {
    t.Number(playerId);
    t.list(Match)(matchList);
    const scores = opponentScores(playerId, matchList);
    const scoresMinusFirstAndLast = removeFirstAndLast(scores);
    return sum(scoresMinusFirstAndLast);
}

/**
 * @returns {number}
 */
function solkoff(playerId, matchList) {
    t.Number(playerId);
    t.list(Match)(matchList);
    const scoreList = opponentScores(playerId, matchList);
    return sum(scoreList);
}

/**
 * Get the cumulative scores of a player's opponents.
 * @returns {number}
 */
function playerOppScoreCum(playerId, matchList) {
    const oppScores = getPlayersByOpponent(
        playerId,
        matchList
    ).filter(
        isNotDummy
    ).map(
        (p) => playerScoreCum(p, matchList)
    );
    return sum(oppScores);
}

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
    t.list(t.Number)(methods);
    t.list(t.Array)(roundList);
    t.maybe(t.Number)(roundId);
    const matchList = rounds2Matches(roundList, roundId);
    const selectedTieBreaks = methods.map((i) => tieBreakMethods[i]);
    const tieBreakNames = selectedTieBreaks.map((m) => m.name);
    // Get a flat list of all of the players and their scores.
    const standings = getAllPlayersFromMatches(
        matchList
    ).filter(
        (id) => id !== DUMMY_ID
    ).map(
        (id) => (Standing({
            id,
            score: playerScore(id, matchList),
            tieBreaks: selectedTieBreaks.map(
                (method) => method.func(id, matchList)
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
    t.list(t.Number)(methods);
    RoundList(roundList);
    t.maybe(t.Number)(roundId);
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

function dueColor(playerId, matchList) {
    t.Number(playerId);
    t.list(Match)(matchList);
    const lastMatch = last(getMatchesByPlayer(playerId, matchList));
    if (!lastMatch) {
        return null;
    }
    const prevColor = lastMatch.players.indexOf(playerId);
    return (prevColor === WHITE) ? BLACK : WHITE;
}

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
export function createPlayerStats({
    id,
    playerDataSource,
    avoidList,
    roundList,
    roundId
}) {
    t.Number(id);
    t.Number(roundId);
    t.list(Player)(playerDataSource);
    AvoidList(avoidList);
    RoundList(roundList);
    const player = getPlayerById(playerDataSource, id);
    const matches = rounds2Matches(roundList, roundId);
    return PlayerStats({
        profile: player,
        rating: player.rating, // is this shortcut necessary?
        id: id, // is this shortcut necessary?
        score: playerScore(id, matches),
        dueColor: dueColor(id, matches),
        colorBalance: playerColorBalance(id, matches),
        opponentHistory: getPlayersByOpponent(id, matches),
        upperHalf: false,
        avoidList: getPlayerAvoidList(id, avoidList),
        hasHadBye: hasHadBye(id, matches),
        isDueBye: false
    });
}

/**
 * @returns {Object.<string, number>} {opponentId: result}
 */
function getResultsByOpponent(playerId, matchList) {
    t.Number(playerId);
    t.list(Match)(matchList);
    const matches = getMatchesByPlayer(playerId, matchList);
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
export {getResultsByOpponent};

function getPerformanceRatings(playerId, matchList) {
    t.Number(playerId);
    t.list(Match)(matchList);
    const matches = getMatchesByPlayer(playerId, matchList);
    // TODO: This could be Don't-Repeat-Yourself'd a bit
    const firstMatch = matches[0];
    const firstColor = firstMatch.players.indexOf(playerId);
    const firstRating = firstMatch.origRating[firstColor];
    const lastMatch = last(matches);
    const lastColor = lastMatch.players.indexOf(playerId);
    const lastRating = lastMatch.newRating[lastColor];
    return [firstRating, lastRating];
}
export {getPerformanceRatings};

export function kFactor(matchCount) {
    t.Number(matchCount);
    const ne = matchCount || 1;
    return (800 / ne);
}

/**
 * @returns {[number, number]}
 */
export function calcNewRatings(origRatings, matchCounts, result) {
    t.tuple([t.Number, t.Number])(origRatings);
    t.tuple([t.Number, t.Number])(matchCounts);
    t.tuple([t.Number, t.Number])(result);
    const whiteElo = new EloRank(kFactor(matchCounts[WHITE]));
    const blackElo = new EloRank(kFactor(matchCounts[BLACK]));
    const FLOOR = 100;
    const scoreExpected = [
        whiteElo.getExpected(origRatings[WHITE], origRatings[BLACK]),
        blackElo.getExpected(origRatings[BLACK], origRatings[WHITE])
    ];
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
    return newRating.map(
        (rating) => (
            rating < FLOOR
            ? FLOOR
            : rating
        )
    );
}
