import t from "tcomb";
import {
    AvoidList,
    DUMMY_ID,
    Match,
    Player,
    RoundList,
    Standing,
    dummyPlayer,
    missingPlayer
} from "../data-types";
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

export function getPlayerById(playerList, id) {
    if (id === DUMMY_ID) {
        return dummyPlayer;
    }
    const player = playerList.filter((p) => p.id === id)[0];
    return (player) ? player : missingPlayer(id);
}

/*******************************************************************************
 * Match functions
 ******************************************************************************/
const isNotBye = (match) => !match.players.includes(DUMMY_ID);
export {isNotBye};

function getMatchesByPlayer(playerId, matchList) {
    t.list(Match)(matchList);
    return matchList.filter((match) => match.players.includes(playerId));
}
export {getMatchesByPlayer};

function getMatchDetailsForPlayer(playerId, match) {
    t.Number(playerId);
    Match(match);
    const index = match.players.indexOf(playerId);
    return {
        color: index,
        newRating: match.newRating[index],
        origRating: match.origRating[index],
        result: match.result[index]
    };
}
export {getMatchDetailsForPlayer};

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


/**
 * @returns {number[]}
 */
export function getAllPlayersFromMatches(matchList) {
    t.list(Match)(matchList);
    const allPlayers = matchList.reduce(
        (acc, match) => acc.concat(match.players),
        []
    );
    return Array.from(new Set(allPlayers));
}

/**
 * Get a list of all of a player's scores from each match.
 */
export function getPlayerScoreList(playerId, matchList) {
    t.Number(playerId);
    t.list(Match)(matchList);
    return getMatchesByPlayer(
        playerId,
        matchList,
    ).map(
        (match) => getMatchDetailsForPlayer(playerId, match).result
    );
}

/**
 * TODO: Maybe merge this with the other function?
 * @returns {number[]}
 */
export function getPlayerScoreListNoByes(playerId, matchList) {
    t.Number(playerId);
    t.list(Match)(matchList);
    return getMatchesByPlayer(
        playerId,
        matchList
    ).filter(
        isNotBye
    ).map(
        (match) => getMatchDetailsForPlayer(playerId, match).result
    );
}

/*******************************************************************************
 * Round functions
 ******************************************************************************/
export function calcNumOfRounds(playerCount) {
    const rounds = Math.ceil(Math.log2(playerCount));
    return (Number.isFinite(rounds)) ? rounds : 0;
}

/*******************************************************************************
 * Avoid list functions
 ******************************************************************************/
export function getPlayerAvoidList(playerId, avoidList) {
    AvoidList(avoidList);
    t.Number(playerId);
    return avoidList.filter( // get pairings with the player
        (pair) => pair.includes(playerId)
    ).reduce( // Flatten the array
        (accumulator, pair) => pair.concat(accumulator),
        []
    ).filter( // filter out the player's id
        (id) => id !== playerId
    );
}

export function cleanAvoidList(avoidList, playerList) {
    AvoidList(avoidList);
    t.list(Player)(playerList);
    const ids = playerList.map((p) => p.id);
    return avoidList.filter(
        (pairs) => (ids.includes(pairs[0]) && ids.includes(pairs[1]))
    );
}
