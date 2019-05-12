import React from "react";
import {createPlayer} from "../data/player";
import demoPlayers from "./demo-players.json";
/**
 * @typedef {import("./dispatch").Action} Action
 * @typedef {import("./dispatch").PlayerAction} PlayerAction
 */

const defaultPlayers = {
    players: demoPlayers.playerList.map((p) => createPlayer(p)),
    avoid: demoPlayers.avoidList
};

/**
 * @param {typeof defaultPlayers} state
 * @param {PlayerAction} action
 */
function playersReducer(state, action ) {
    const {players, avoid} = state;
    switch (action.type) {
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
    default:
        throw new Error("Unexpected action type");
    }
}

/** @type {{playerState: typeof defaultPlayers, playerDispatch: React.Dispatch<PlayerAction>}} */
const defaultContext = null;
const PlayerContext = React.createContext(defaultContext);

function usePlayerReducer() {
    return React.useReducer(playersReducer, defaultPlayers);
}

export function usePlayers() {
    return React.useContext(PlayerContext);
}

/**
 * @param {Object} props
 */
export function PlayersProvider(props) {
    const [playerState, playerDispatch] = usePlayerReducer();
    return (
        <PlayerContext.Provider value={{playerState, playerDispatch}}>
            {props.children}
        </PlayerContext.Provider>
    );
}
