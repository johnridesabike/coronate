// @ts-check
import {createContext} from "react";
import createPlayer from "./chess-tourney/player";
import defaultOptions from "./demo-options.json";
import defaultPlayers from "./demo-players.json";

/**
 * @param {Object} state
 * @param {Object} action
 */
function dataReducer(state, action) {
    switch (action.type) {
    // Options
    case "SET_BYE_VALUE":
        return Object.assign(
            {},
            state,
            {byeValue: action.byeValue}
        );
    // Players
    case "ADD_PLAYER":
        return Object.assign(
            {},
            state,
            {players: state.players.concat([action.newPlayer])}
        );
    case "DEL_PLAYER":
        return Object.assign(
            {},
            state,
            {
                players: state.players.filter((p) => p.id !== action.player.id),
                avoid: state.avoid.filter(
                    (pair) => !pair.includes(action.player.id)
                )
            }
        );
    case "SET_PLAYER_MATCHCOUNT":
        Object.assign(
            state.players[state.players.map((p) => p.id).indexOf(action.id)],
            {matchCount: action.matchCount}
        );
        return Object.assign({}, state);
    case "SET_PLAYER_RATING":
        Object.assign(
            state.players[state.players.map((p) => p.id).indexOf(action.id)],
            {rating: action.rating}
        );
        return Object.assign({}, state);
    case "ADD_AVOID_PAIR":
        return Object.assign(
            {},
            state,
            {avoid: state.avoid.concat([action.pair])}
        );
    case "DEL_AVOID_PAIR":
        return Object.assign(
            {},
            state,
            {avoid: state.avoid.filter(
                (pair) => !(
                    pair.includes(action.pair[0])
                    && pair.includes(action.pair[1])
                )
            )}
        );
    default:
        throw new Error("Unexpected action type");
    }
}
Object.freeze(dataReducer);
export {dataReducer};

const defaultData = {
    options: defaultOptions,
    players: defaultPlayers.playerList.map((p) => createPlayer(p)),
    avoid: defaultPlayers.avoidList
};
export {defaultData};

const DataContext = createContext(null);
export {DataContext};