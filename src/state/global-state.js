// @ts-check
import {createContext} from "react";
import last from "ramda/src/last";
import curry from "ramda/src/curry";
import arrayMove from "array-move";
import {createPlayer, getPlayerById} from "../data/player";
import {getById} from "../data/utility";
import defaultOptions from "./demo-options.json";
import defaultPlayers from "./demo-players.json";
import defaultTourneyList from "./demo-tourney.json";
import {autoPair, manualPair, swapColors} from "./match-functions";
/**
 * @typedef {import("./dispatch").Action} Action
 * @typedef {import("./dispatch").GlobalState} GlobalState
 */

/**
 * @type {GlobalState}
 */
const defaultData = {
    options: defaultOptions,
    players: defaultPlayers.playerList.map((p) => createPlayer(p)),
    avoid: defaultPlayers.avoidList,
    // @ts-ignore
    tourneys: defaultTourneyList
};
export {defaultData};

/**
 * @param {GlobalState} state
 * @param {Action} action
 * @returns {GlobalState}
 */
function dataReducer(state, action) {
    const {avoid, players, options, tourneys} = state;
    const getPlayer = curry(getPlayerById)(players);
    switch (action.type) {
    // Options
    case "SET_BYE_VALUE":
        options.byeValue = action.byeValue;
        return Object.assign({}, state);
    // Players
    case "ADD_PLAYER":
        return Object.assign(
            {},
            state,
            {players: players.concat([action.newPlayer])}
        );
    case "DEL_PLAYER":
        return Object.assign(
            {},
            state,
            {
                players: players.filter((p) => p.id !== action.id),
                avoid: avoid.filter(
                    (pair) => !pair.includes(action.id)
                )
            }
        );
    case "SET_PLAYER_MATCHCOUNT":
        Object.assign(
            players[players.map((p) => p.id).indexOf(action.id)],
            {matchCount: action.matchCount}
        );
        return Object.assign({}, state);
    case "SET_PLAYER_RATING":
        Object.assign(
            players[players.map((p) => p.id).indexOf(action.id)],
            {rating: action.rating}
        );
        return Object.assign({}, state);
    // Avoid
    case "ADD_AVOID_PAIR":
        return Object.assign(
            {},
            state,
            {avoid: avoid.concat([action.pair])}
        );
    case "DEL_AVOID_PAIR":
        return Object.assign(
            {},
            state,
            {avoid: avoid.filter(
                (pair) => !(
                    pair.includes(action.pair[0])
                    && pair.includes(action.pair[1])
                )
            )}
        );
    // Tournaments
    case "ADD_TOURNEY":
        return Object.assign(
            {},
            state,
            {tourneys: tourneys.concat([action.tourney])}
        );
    case "DEL_TOURNEY":
        return Object.assign(
            {},
            state,
            {tourneys: tourneys.filter((ignore, i) => i !== action.index)}
        );
    case "ADD_ROUND":
        tourneys[action.tourneyId].roundList = (
            tourneys[action.tourneyId].roundList.concat([[]])
        );
        return Object.assign({}, state);
    case "DEL_LAST_ROUND":
        // if a match has been scored, then reset it.
        last(
            tourneys[action.tourneyId].roundList
        ).forEach(function (match) {
            if (match.result.reduce((a, b) => a + b) !== 0) {
                match.players.forEach(function (pId, color) {
                    getPlayer(pId).matchCount -= 1;
                    getPlayer(pId).rating = (
                        match.origRating[color]
                    );
                });
            }
        });
        tourneys[action.tourneyId].roundList = (
            tourneys[action.tourneyId].roundList.slice(
                0,
                tourneys[action.tourneyId].roundList.length - 1
            )
        );
        return Object.assign({}, state);
    case "ADD_TIEBREAK":
        tourneys[action.tourneyId].tieBreaks = (
            tourneys[action.tourneyId].tieBreaks.concat([action.id])
        );
        return Object.assign({}, state);
    case "DEL_TIEBREAK":
        tourneys[action.tourneyId].tieBreaks = (
            tourneys[action.tourneyId].tieBreaks.filter(
                (id) => id !== action.id
            )
        );
        return Object.assign({}, state);
    case "MOVE_TIEBREAK":
        tourneys[action.tourneyId].tieBreaks = arrayMove(
            tourneys[action.tourneyId].tieBreaks,
            action.oldIndex,
            action.newIndex
        );
        return Object.assign({}, state);
    case "SET_TOURNEY_PLAYERS":
        tourneys[action.tourneyId].players = action.players;
        return Object.assign({}, state);
    case "SET_BYE_QUEUE":
        tourneys[action.tourneyId].byeQueue = action.byeQueue;
        return Object.assign({}, state);
    case "AUTO_PAIR":
        tourneys[action.tourneyId].roundList[action.roundId] = (
            tourneys[action.tourneyId].roundList[action.roundId].concat(
                autoPair(
                    state,
                    action.tourneyId,
                    action.roundId,
                    action.unpairedPlayers
                )
            )
        );
        return Object.assign({}, state);
    case "MANUAL_PAIR":
        tourneys[action.tourneyId].roundList[action.roundId] = (
            tourneys[action.tourneyId].roundList[action.roundId].concat([
                manualPair(
                    state,
                    action.pair
                )
            ])
        );
        return Object.assign({}, state);
    case "SET_MATCH_RESULT":
        getById(
            tourneys[action.tourneyId].roundList[action.roundId],
            action.matchId
        ).result = action.result;
        getById(
            tourneys[action.tourneyId].roundList[action.roundId],
            action.matchId
        ).newRating = action.newRating;
        return Object.assign({}, state);
    case "DEL_MATCH":
        tourneys[action.tourneyId].roundList[action.roundId] = (
            tourneys[action.tourneyId].roundList[action.roundId].filter(
                (match) => match.id !== action.matchId
            )
        );
        return Object.assign({}, state);
    case "SWAP_COLORS":
        swapColors(state, action.tourneyId, action.roundId, action.matchId);
        return Object.assign({}, state);
    case "MOVE_MATCH":
        tourneys[action.tourneyId].roundList[action.roundId] = arrayMove(
            tourneys[action.tourneyId].roundList[action.roundId],
            action.oldIndex,
            action.newIndex
        );
        return Object.assign({}, state);
    default:
        throw new Error("Unexpected action type");
    }
}
Object.freeze(dataReducer);
export {dataReducer};

/** @type {{data: GlobalState, dispatch: React.Dispatch<Action>}} */
const defaultContext = null;
const DataContext = createContext(defaultContext);
export {DataContext};
