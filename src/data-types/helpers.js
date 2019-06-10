import {DUMMY_ID} from "./constants";
import {assoc} from "ramda";
import {createPlayer} from "./factories";
import t from "tcomb";
import types from "./types";

/*******************************************************************************
 * Player functions
 ******************************************************************************/
// These are useful for passing to `filter()` methods.
const isDummyId = (playerId) => types.Id(playerId) === DUMMY_ID;
export {isDummyId};
// This can take any object with a compliant `id` property.
const isDummyObj = (playerObj) => types.Id(playerObj.id) === DUMMY_ID;
export {isDummyObj};

// This is the dummy profile that `getPlayerMaybe()` returns for bye rounds.
const dummyPlayer = createPlayer({
    firstName: "Bye",
    id: DUMMY_ID,
    lastName: "Player",
    type: "dummy"
});

// If `getPlayerMaybe()` can't find a profile (e.g. if it was deleted) then it
// outputs this instead. The ID will be the same as missing player's ID.
const createMissingPlayer = (id) => createPlayer({
    firstName: "Anonymous",
    id: id,
    lastName: "Player",
    type: "missing"
});

// This function should always be used in components that *might* not be able to
// display current player information. This includes bye rounds with "dummy"
// players, or scoreboards where a player may have been deleted.
// This automatically curries for easy use across the same context.
export function getPlayerMaybe(playerDict, id) {
    if (id === undefined) {
        return getPlayerMaybe.bind(null, playerDict);
    }
    if (id === DUMMY_ID) {
        return dummyPlayer;
    }
    const player = t.dict(types.Id, types.Player)(playerDict)[id];
    return (player) ? player : createMissingPlayer(id);
}

// const isNotBye = (match) => !match.playerIds.includes(DUMMY_ID);
// export {isNotBye};

/*******************************************************************************
 * Round functions
 ******************************************************************************/
export function calcNumOfRounds(playerCount) {
    const roundCount = Math.ceil(Math.log2(playerCount));
    return (Number.isFinite(roundCount)) ? roundCount : 0;
}

// This flattens a list of rounds to a list of matches.
// The optional `lastRound` parameter will slice the rounds to only the last
// index specified. For example: if you just want to see the scores through
// round 2 and not include round 3.
export function rounds2Matches(roundList, lastRound = null) {
    const rounds = (lastRound === null)
        ? roundList
        : roundList.slice(0, lastRound + 1);
    return rounds.reduce((acc, round) => acc.concat(round), []);
}

// This creates a filtered version of `players` with only the players that are
// not matched for the specified round.
export function getUnmatched(roundList, players, roundId) {
    const matchList = types.RoundList(roundList)[t.Number(roundId)] || [];
    const matchedIds = matchList.reduce(
        (acc, match) => acc.concat(match.playerIds),
        []
    );
    const playerList = t.list(types.Player)(Object.values(players));
    const unmatched = playerList.reduce(
        (acc, player) => (
            (matchedIds.includes(player.id))
            ? acc
            : assoc(player.id, player, acc)
        ),
        {}
    );
    return unmatched;
}

// Returns a boolean for whether or not a round has completed.
// This automatically curries for easy application across a single component.
export function isRoundComplete(tourney, players, roundId) {
    if (players === undefined) {
        return isRoundComplete.bind(null, tourney);
    } else if (roundId === undefined) {
        return isRoundComplete.bind(null, tourney, players);
    }
    if (roundId < tourney.roundList.length - 1) {
        // If it's not the last round, it's complete.
        return true;
    }
    const unmatched = getUnmatched(tourney.roundList, players, roundId);
    const results = tourney.roundList[roundId].map(
        (match) => match.result[0] + match.result[1]
    );
    return Object.keys(unmatched).length === 0 && !results.includes(0);
}

/*******************************************************************************
 * Match functions
 ******************************************************************************/
// Returns whether or not a player has played a bye round.
export function hasHadBye(matchList, playerId) {
    return t.list(types.Match)(matchList).filter(
        (match) => match.playerIds.includes(playerId)
    ).reduce(
        (acc, match) => acc.concat(match.playerIds),
        []
    ).includes(DUMMY_ID);
}

export function getAllPlayerIdsFromMatches(matchList) {
    const allPlayers = t.list(types.Match)(matchList).reduce(
        (acc, match) => acc.concat(match.playerIds),
        []
    );
    return Array.from(new Set(allPlayers));
}

/*******************************************************************************
 * Avoid list functions
 ******************************************************************************/
// Returns a flattened list of all of the player set to avoid a specific player
// ID. This automatically curries for easy reuse across the same component.
export function getPlayerAvoidList(avoidList, playerId) {
    if (playerId === undefined) {
        return getPlayerAvoidList.bind(null, avoidList);
    }
    return t.list(types.AvoidPair)(avoidList).filter(
        // get pairings with the player
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
    t.list(types.AvoidPair)(avoidList);
    t.list(types.Player)(playerList);
    const ids = playerList.map((p) => p.id);
    return avoidList.filter(
        (pairs) => (ids.includes(pairs[0]) && ids.includes(pairs[1]))
    );
}
