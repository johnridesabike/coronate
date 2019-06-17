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
export function getPlayerMaybe(playerDict, id) {
    if (id === DUMMY_ID) {
        return dummyPlayer;
    }
    const player = t.dict(types.Id, types.Player)(playerDict)[id];
    return player ? player : createMissingPlayer(id);
}

/*******************************************************************************
 * Round functions
 ******************************************************************************/

// This flattens a list of rounds to a list of matches.
// The optional `lastRound` parameter will slice the rounds to only the last
// index specified. For example: if you just want to see the scores through
// round 2 and not include round 3.
export function rounds2Matches(roundList, lastRound = null) {
    const rounds = (
        lastRound === null
        ? roundList
        : roundList.slice(0, lastRound + 1)
    );
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
            matchedIds.includes(player.id)
            ? acc
            : assoc(player.id, player, acc)
        ),
        {}
    );
    return unmatched;
}
