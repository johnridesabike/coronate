import {
    AvoidPair,
    Id,
    Match,
    Player,
    PlayerStats,
    RoundList,
    Standing
} from "../data-types";
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
    areScoresEqual,
    getAllPlayersFromMatches,
    getMatchDetailsForPlayer,
    getMatchesByPlayer,
    getPlayerAvoidList,
    isNotDummy,
    rounds2Matches
} from "./helpers";
import {
    createTieBreakSorter,
    getColorBalanceScore,
    getDueColor,
    getPlayerScore,
    getPlayersByOpponent,
    hasHadBye,
    tieBreakMethods
} from "./scoring";
import t from "tcomb";
/**
 * Sort the standings by score, see USCF tie-break rules from § 34.
 * @returns {[Standing[], string[]]} The standings and the list of method used
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
    ).map(
        (id) => Standing({
            id,
            score: getPlayerScore(id, matchList),
            tieBreaks: selectedTieBreaks.map(({func}) => func(id, matchList))
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
    const standingsFlatNoByes = standingsFlat.filter(isNotDummy);
    const standingsTree = standingsFlatNoByes.reduce(
        /** @param {Standing[][]} acc*/
        function assignStandingsToTree(acc, standing, i, orig) {
            const prevStanding = orig[i - 1];
            const isNewRank = (
                // Always make a new rank for the first player
                (i === 0) ? true : !areScoresEqual(standing, prevStanding)
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
    avoidList,
    id,
    players,
    roundList,
    roundId
}) {
    Id(id);
    t.Number(roundId);
    t.dict(t.String, Player)(players);
    t.list(AvoidPair)(avoidList);
    RoundList(roundList);
    // const player = getPlayerById(playerDataSource, id);
    const matches = rounds2Matches(roundList, roundId);
    return PlayerStats({
        avoidList: getPlayerAvoidList(id, avoidList),
        colorBalance: getColorBalanceScore(id, matches),
        dueColor: getDueColor(id, matches),
        hasHadBye: hasHadBye(id, matches),
        id: id, // is this shortcut necessary?
        isDueBye: false,
        opponentHistory: getPlayersByOpponent(id, matches),
        profile: players[id],
        rating: players[id].rating, // is this shortcut necessary?
        score: getPlayerScore(id, matches),
        upperHalf: false
    });
}

/**
 * NOTE: these params are flipped. Should others be flipped too?
 * @returns {Object.<string, number>} {opponentId: result}
 */
function getResultsByOpponent(matchList, playerId) {
    Id(playerId);
    t.list(Match)(matchList);
    const matches = getMatchesByPlayer(playerId, matchList);
    return matches.reduce(
        function (acc, match) {
            const opponent = match.playerIds.filter(
                (id) => id !== playerId
            )[0];
            const {result} = getMatchDetailsForPlayer(playerId, match);
            // This sets a default result of 0 and then adds the existing
            // result. Most of the time, this would be the same as using
            // `set()` with the result, but if two players play each other
            // multiple times then the total results will be displayed.
            return over(
                lensProp(opponent),
                pipe(defaultTo(0), add(result)),
                acc
            );
        },
        {}
    );
}
export {getResultsByOpponent};

/**
 * NOTE: these params are flipped. Should others be flipped too?
 */
function getPerformanceRatings(matchList, playerId) {
    Id(playerId);
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
