import {AvoidPair, Id, Match, Player, RoundList} from "./types";
import {DUMMY_ID} from "./constants";
import {assoc} from "ramda";
import {createPlayer} from "./factories";
import t from "tcomb";

const isNotDummyId = (playerId) => Id(playerId) !== DUMMY_ID;
export {isNotDummyId};

const isNotDummyObj = (playerObj) => playerObj.id !== DUMMY_ID;
export {isNotDummyObj};

function getMatchesByPlayer(playerId, matchList) {
    return matchList.filter((match) => match.playerIds.includes(playerId));
}

export function hasHadBye(playerId, matchList) {
    return getMatchesByPlayer(
        Id(playerId),
        t.list(Match)(matchList)
    ).reduce(
        (acc, match) => acc.concat(match.playerIds),
        []
    ).includes(DUMMY_ID);
}
/**
 * The dummy player profile data to display in bye matches.
 */
const dummyPlayer = createPlayer({
    firstName: "Bye",
    id: DUMMY_ID,
    lastName: "Player",
    type: "dummy"
});
export {dummyPlayer};

/**
 * When `getPlayerMaybe()` can't find a profile, it outputs this instead.
 */
const createMissingPlayer = (id) => createPlayer({
    firstName: "Anonymous",
    id: id,
    lastName: "Player",
    type: "missing"
});

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
    return (player) ? player : createMissingPlayer(id);
}

const isNotBye = (match) => !match.playerIds.includes(DUMMY_ID);
export {isNotBye};

/**
 * Flatten a list of rounds to a list of matches.
 * @param {number?} lastRound An optional index for the last round to use. It's
 * useful if you only want to, for example, view the results for rounds 1-2 and
 * not 3-4.
 */
export function rounds2Matches(roundList, lastRound = null) {
    const rounds = (lastRound === null)
        ? roundList
        : roundList.slice(0, lastRound + 1);
    return rounds.reduce((acc, round) => acc.concat(round), []);
}

export function getAllPlayersFromMatches(matchList) {
    const allPlayers = t.list(Match)(matchList).reduce(
        (acc, match) => acc.concat(match.playerIds),
        []
    );
    return Array.from(new Set(allPlayers));
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
export function getUnmatched(roundList, players, roundId) {
    const matchList = RoundList(roundList)[t.Number(roundId)] || [];
    const matchedIds = matchList.reduce(
        (acc, match) => acc.concat(match.playerIds),
        []
    );
    const playerList = t.list(Player)(Object.values(players));
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

export function isRoundComplete(tourney, players, roundId) {
    if (roundId < tourney.roundList.length - 1) {
        // If it's not the last round, it's complete
        return true;
    }
    const unmatched = getUnmatched(tourney.roundList, players, roundId);
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
