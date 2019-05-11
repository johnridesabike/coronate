import curry from "ramda/src/curry";
import {BLACK, WHITE} from "../data/constants";
import createMatch from "../data/match";
import {hasHadBye} from "../pairing-scoring/scoring";
import {dummyPlayer, getPlayerById} from "../data/player";
import pairPlayers from "../pairing-scoring/pairing";
import {getById} from "../data/utility";
/**
 * @typedef {import("./dispatch").GlobalState} GlobalState
 * @typedef {import("../data/index").Player} Player
*/

/**
 * @param {GlobalState} state
 * @param {number} tourneyId
 * @param {number} roundId
 * @param {import("./dispatch").PlayerState} playerState
 * @param {number[]} unPairedPlayers
 */
function autoPair(state, playerState, tourneyId, roundId, unPairedPlayers) {
    const tourney = state.tourneys[tourneyId];
    const roundList = tourney.roundList;
    const getPlayer = curry(getPlayerById)(playerState.players);
    const nextBye = tourney.byeQueue.filter(
        (pId) => !hasHadBye(pId, roundList)
    )[0];
    let byeMatch = null;
    if (nextBye >= 0) {
        byeMatch = createMatch({
            id: nextBye + "-" + dummyPlayer.id,
            players: [nextBye, dummyPlayer.id],
            origRating: [
                getPlayer(nextBye).rating,
                dummyPlayer.rating
            ],
            newRating: [
                getPlayer(nextBye).rating,
                dummyPlayer.rating
            ]
        });
        unPairedPlayers = unPairedPlayers.filter((pId) => pId !== nextBye);
    }
    const pairs = pairPlayers(
        unPairedPlayers,
        roundId,
        roundList,
        playerState.players,
        playerState.avoid
    );
    const newMatchList = pairs.map(
        (pair) => createMatch({
            id: pair.join("-"),
            players: [pair[WHITE], pair[BLACK]],
            origRating: [
                getPlayer(pair[WHITE]).rating,
                getPlayer(pair[BLACK]).rating
            ],
            newRating: [
                getPlayer(pair[WHITE]).rating,
                getPlayer(pair[BLACK]).rating
            ]
        })
    );
    if (byeMatch) {
        newMatchList.push(byeMatch);
    }
    // this covers manual bye matches and auto-paired bye matches
    newMatchList.forEach(function (match) {
        const dummy = match.players.indexOf(dummyPlayer.id);
        if (dummy === BLACK) {
            match.result[WHITE] = state.options.byeValue;
        }
        if (dummy === WHITE) {
            match.result[BLACK] = state.options.byeValue;
        }
    });
    return newMatchList;
}
Object.freeze(autoPair);
export {autoPair};

/**
 * @param {GlobalState} state
 * @param {Player[]} players
 * @param {number[]} pair
 */
function manualPair(state, players, pair) {
    const getPlayer = curry(getPlayerById)(players);
    const match = createMatch({
        id: pair.join("-"),
        players: [pair[WHITE], pair[BLACK]],
        origRating: [
            getPlayer(pair[WHITE]).rating,
            getPlayer(pair[BLACK]).rating
        ],
        newRating: [
            getPlayer(pair[WHITE]).rating,
            getPlayer(pair[BLACK]).rating
        ]
    });
    if (pair[WHITE] === dummyPlayer.id) {
        match.result = [state.options.byeValue, 0];
    }
    if (pair[BLACK] === dummyPlayer.id) {
        match.result = [0, state.options.byeValue];
    }
    return match;
}
Object.freeze(manualPair);
export {manualPair};

/**
 * @param {GlobalState} state
 * @param {number} tourneyId
 * @param {number} roundId
 * @param {string} matchId
 */
function swapColors(state, tourneyId, roundId, matchId) {
    const round = state.tourneys[tourneyId].roundList[roundId];
    const match = getById(round, matchId);
    match.players.reverse();
    match.origRating.reverse();
    match.newRating.reverse();
}
Object.freeze(swapColors);
export {swapColors};
