import t from "tcomb";
import {
    add,
    append,
    defaultTo,
    last,
    lensIndex,
    lensProp,
    over,
    pipe,
    sort
} from "ramda";
import {
    AvoidList,
    Match,
    Player,
    PlayerStats,
    RoundList,
    Standing
} from "../data-types";
import {
    areScoresEqual,
    getAllPlayersFromMatches,
    getMatchesByPlayer,
    getPlayerAvoidList,
    getPlayerById,
    getMatchDetailsForPlayer,
    isNotDummy,
    rounds2Matches
} from "./helpers";
import {
    createTieBreakSorter,
    getDueColor,
    getColorBalanceScore,
    getPlayerScore,
    getPlayersByOpponent,
    hasHadBye,
    tieBreakMethods
} from "./scoring";
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
        isNotDummy
    ).map(
        (id) => Standing({
            id,
            score: getPlayerScore(id, matchList),
            tieBreaks: selectedTieBreaks.map(
                (method) => method.func(id, matchList)
            )
        })
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
        score: getPlayerScore(id, matches),
        dueColor: getDueColor(id, matches),
        colorBalance: getColorBalanceScore(id, matches),
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
            const {result} = getMatchDetailsForPlayer(playerId, match);
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
    const firstMatch = matches[0];
    const lastMatch = last(matches);
    return [
        getMatchDetailsForPlayer(playerId, firstMatch).origRating,
        getMatchDetailsForPlayer(playerId, lastMatch).newRating
    ];
}
export {getPerformanceRatings};
