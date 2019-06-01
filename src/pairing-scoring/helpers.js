import {
    AvoidPair,
    DUMMY_ID,
    Id,
    Match,
    Player,
    RoundList,
    Standing,
    Tournament,
    dummyPlayer,
    missingPlayer
} from "../data-types";
import {assoc} from "ramda";
import t from "tcomb";
/*******************************************************************************
 * Player functions
 ******************************************************************************/
const isNotDummy = (playerId) => playerId !== DUMMY_ID;
export {isNotDummy};

export function areScoresEqual(standing1, standing2) {
    Standing(standing1);
    Standing(standing2);
    // Check if any of them aren't equal
    if (standing1.score !== standing2.score) {
        return false;
    }
    // Check if any tie-break values are not equal
    return !(
        standing1.tieBreaks.reduce(
            (acc, value, i) => acc.concat(value !== standing2.tieBreaks[i]),
            []
        ).includes(true)
    );
}

/**
 * Retrive a specific player from a list or object.
 * @param playerList This can either be typed as `[Player1, Player1]` or
 * `{"1": Player, "2": Player}`, where `Player1.id` equals its dict key.
 * @param id the `id` property of the desired `Player` object.
 * @returns The desired Player object.
 */
export function getPlayerById(playerList, id) {
    t.union([
        t.list(Player),
        t.dict(Id, Player)
    ])(playerList);
    if (id === DUMMY_ID) {
        return dummyPlayer;
    }
    const player = (playerList.filter)
        ? playerList.filter((p) => p.id === id)[0]
        : playerList[id];
    return (player) ? player : missingPlayer(id);
}

/**
 * A replacement for `getPlayerById`, with an emphasis on the indented feature
 * of *maybe* getting a player, *maybe* getting a `dummyPlayer`, or *maybe*
 * getting a missing (deleted) player.
 */
export function getPlayerMaybe(playerDict, id) {
    t.dict(Id, Player)(playerDict);
    Id(id);
    if (id === DUMMY_ID) {
        return dummyPlayer;
    }
    const player = playerDict[id];
    return (player) ? player : missingPlayer(id);
}

/*******************************************************************************
 * Match functions
 ******************************************************************************/
const isNotBye = (match) => !match.playerIds.includes(DUMMY_ID);
export {isNotBye};

export function getMatchesByPlayer(playerId, matchList) {
    t.list(Match)(matchList);
    return matchList.filter((match) => match.playerIds.includes(playerId));
}

export function getMatchesByPlayerNoByes(playerId, matchList) {
    t.list(Match)(matchList);
    return matchList.filter(
        (match) => match.playerIds.includes(playerId) && isNotBye(match)
    );
}

export function getMatchDetailsForPlayer(playerId, match) {
    Id(playerId);
    Match(match);
    const index = match.playerIds.indexOf(playerId);
    return {
        color: index,
        newRating: match.newRating[index],
        origRating: match.origRating[index],
        result: match.result[index]
    };
}

/**
 * Flatten a list of rounds to a list of matches.
 */
export function rounds2Matches(roundList, roundId = null) {
    RoundList(roundList);
    t.maybe(t.Number)(roundId);
    const rounds = (
        (roundId === null)
        ? roundList
        : roundList.slice(0, roundId + 1)
    );
    return rounds.reduce((acc, round) => acc.concat(round), []);
}

export function getAllPlayersFromMatches(matchList) {
    t.list(Match)(matchList);
    const allPlayers = matchList.reduce(
        (acc, match) => acc.concat(match.playerIds),
        []
    );
    return Array.from(new Set(allPlayers));
}

/**
 * Get a list of all of a player's scores from each match.
 */
export function getPlayerScoreList(playerId, matchList) {
    Id(playerId);
    t.list(Match)(matchList);
    return getMatchesByPlayer(
        playerId,
        matchList,
    ).map(
        (match) => getMatchDetailsForPlayer(playerId, match).result
    );
}

export function getPlayerScoreListNoByes(playerId, matchList) {
    Id(playerId);
    t.list(Match)(matchList);
    return getMatchesByPlayerNoByes(
        playerId,
        matchList
    ).map(
        (match) => getMatchDetailsForPlayer(playerId, match).result
    );
}

/*******************************************************************************
 * Round functions
 ******************************************************************************/
export function calcNumOfRounds(playerCount) {
    const roundCount = Math.ceil(Math.log2(playerCount));
    return (Number.isFinite(roundCount)) ? roundCount : 0;
}
/**
 * This creates a filtered version of `players` with only the players that are
 * not matched for the specified round.
 */
export function getUnmatched(tourney, players, roundId) {
    Tournament(tourney);
    t.dict(Id, Player)(players);
    t.Number(roundId);
    const matchList = tourney.roundList[roundId] || [];
    const matchedIds = matchList.reduce(
        (acc, match) => acc.concat(match.playerIds),
        []
    );
    const unmatched = Object.values(players).reduce(
        (acc, player) => (
            (matchedIds.includes(player.id))
            ? acc
            : assoc(player.id, player, acc)
        ),
        {}
    );
    return unmatched;
}

export function isRoundComplete(tourney, players, roundId) {
    const unmatched = getUnmatched(tourney, players, roundId);
    const results = tourney.roundList[roundId].map(
        (match) => match.result[0] + match.result[1]
    );
    return Object.keys(unmatched).length === 0 && !results.includes(0);
}

/*******************************************************************************
 * Avoid list functions
 ******************************************************************************/
export function getPlayerAvoidList(playerId, avoidList) {
    t.list(AvoidPair)(avoidList);
    Id(playerId);
    return avoidList.filter( // get pairings with the player
        (pair) => pair.includes(playerId)
    ).reduce( // Flatten the array
        (accumulator, pair) => pair.concat(accumulator),
        []
    ).filter( // filter out the player's id
        (id) => id !== playerId
    );
}

// TODO: This isn't currently in use, but it probably should be.
export function cleanAvoidList(avoidList, playerList) {
    t.list(AvoidPair)(avoidList);
    t.list(Player)(playerList);
    const ids = playerList.map((p) => p.id);
    return avoidList.filter(
        (pairs) => (ids.includes(pairs[0]) && ids.includes(pairs[1]))
    );
}
