// TODO: Clean this up. Refactor unnecessary functions, etc.
import {init, pipe, tail} from "ramda";
import t from "tcomb";
import {WHITE, BLACK, DUMMY_ID} from "./constants";
import {
    createPlayer,
    dummyPlayer,
    RoundList,
    Match,
    AvoidList
} from "../factories";

const ScoreCalculator = t.func(
    [t.Number, RoundList, t.maybe(t.Number)],
    t.Any,
    "ScoreCalculator"
);
export {ScoreCalculator};
/*******************************************************************************
 * Player functions
 ******************************************************************************/
const isNotDummy = (playerId) => playerId !== DUMMY_ID;
export {isNotDummy};

const switchColor = (color) => (color === WHITE) ? BLACK : WHITE;
export {switchColor};

export function areScoresEqual(standing1, standing2) {
    // Check if any of them aren't equal
    if (standing1.score !== standing2.score) {
        return false;
    }
    // Check if any values are not equal
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
    return (
        (player)
        ? player
        : createPlayer({
            id: id,
            firstName: "Anonymous",
            type: "missing"
        })
    );
}

/*******************************************************************************
 * Match functions
 ******************************************************************************/
const isNotBye = (match) => !match.players.includes(DUMMY_ID);
export {isNotBye};

const getMatchesByPlayer = ScoreCalculator.of(
    function (playerId, roundList, roundId = null) {
        const rounds = (
            (roundId === null)
            ? roundList
            : roundList.slice(0, roundId + 1)
        );
        return rounds.reduce( // flatten the rounds to just the matches
            (acc, round) => acc.concat(round),
            []
        ).filter(
            (match) => match.players.includes(playerId)
        );
    }
);
export {getMatchesByPlayer};


/**
 * @returns {number[]}
 */
export function getAllPlayersFromMatches(roundList) {
    const allPlayers = roundList.reduce( // flatten the rounds
        (acc, round) => acc.concat(round),
        []
    ).reduce( // flaten the players
        (acc, match) => acc.concat(match.players),
        []
    );
    return Array.from(new Set(allPlayers));
}

/**
 * Get a list of all of a player's scores from each match.
 */
const playerScoreList = ScoreCalculator.of(
    (playerId, roundList, roundId = null) => (
        getMatchesByPlayer(
            playerId,
            roundList,
            roundId
        ).map(
            (match) => match.result[match.players.indexOf(playerId)]
        )
    )
);
export {playerScoreList};

const removeFirstAndLast = pipe(init, tail);
export {removeFirstAndLast};

/*******************************************************************************
 * Round functions
 ******************************************************************************/
export function playerColorInRound(playerId, matchList) {
    t.Number(playerId);
    t.assert(t.list(Match).is(matchList));
    const match = matchList.filter((m) => m.players.includes(playerId))[0];
    return (
        (match)
        ? match.players.indexOf(playerId)
        : null
    );
}

/*******************************************************************************
 * Avoid list functions
 ******************************************************************************/
export function getPlayerAvoidList(playerId, avoidList) {
    t.assert(AvoidList.is(avoidList));
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
    const ids = playerList.map((p) => p.id);
    return avoidList.filter(
        (pairs) => (ids.includes(pairs[0]) && ids.includes(pairs[1]))
    );
}

/*******************************************************************************
 * General functions
 ******************************************************************************/
export function calcNumOfRounds(playerCount) {
    const rounds = Math.ceil(Math.log2(playerCount));
    return (
        (Number.isFinite(rounds))
        ? rounds
        : 0
    );
}

export function getById(list, id) {
    return list.filter((x) => x.id === id)[0];
}

export function getIndexById(list, id) {
    return list.indexOf(getById(list, id));
}
