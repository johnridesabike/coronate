// @ts-check
import {BLACK, WHITE} from "../data/constants";
import createMatch from "../data/match";
import {hasHadBye} from "../pairing-scoring/scoring";
import {dummyPlayer, getPlayer} from "../data/player";
import pairPlayers from "../pairing-scoring/pairing";
import {getById} from "../data/utility";
/**
* @typedef {import("./dispatch").GlobalState} GlobalState
*/

/**
 * @param {GlobalState} state
 * @param {number} tourneyId
 * @param {number} roundId
 * @param {number[]} unPairedPlayers
 */
function autoPair(state, tourneyId, roundId, unPairedPlayers) {
    const tourney = state.tourneys[tourneyId];
    const roundList = tourney.roundList;
    const nextBye = tourney.byeQueue.filter(
        (pId) => !hasHadBye(pId, roundList)
    )[0];
    let byeMatch = null;
    if (nextBye >= 0) {
        byeMatch = createMatch({
            id: nextBye + "-" + dummyPlayer.id,
            players: [nextBye, dummyPlayer.id],
            origRating: [
                getPlayer(nextBye, state.players).rating,
                dummyPlayer.rating
            ],
            newRating: [
                getPlayer(nextBye, state.players).rating,
                dummyPlayer.rating
            ]
        });
        unPairedPlayers = unPairedPlayers.filter((pId) => pId !== nextBye);
    }
    const pairs = pairPlayers(
        unPairedPlayers,
        roundId,
        roundList,
        state.players,
        state.avoid
    );
    const newMatchList = pairs.map(
        (pair) => createMatch({
            id: pair.join("-"),
            players: [pair[WHITE], pair[BLACK]],
            origRating: [
                getPlayer(pair[WHITE], state.players).rating,
                getPlayer(pair[BLACK], state.players).rating
            ],
            newRating: [
                getPlayer(pair[WHITE], state.players).rating,
                getPlayer(pair[BLACK], state.players).rating
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
 * @param {number[]} pair
 */
function manualPair(state, pair) {
    const match = createMatch({
        id: pair.join("-"),
        players: [pair[WHITE], pair[BLACK]],
        origRating: [
            getPlayer(pair[WHITE], state.players).rating,
            getPlayer(pair[BLACK], state.players).rating
        ],
        newRating: [
            getPlayer(pair[WHITE], state.players).rating,
            getPlayer(pair[BLACK], state.players).rating
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
 * @param {number} matchId
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
