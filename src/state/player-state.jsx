import React from "react";
// This will cause Webpack to import the entire Ramda library, but we're using
// so much of it that cherry-picking individual files has virtually no benefit.
import {
    append,
    lensPath,
    filter,
    findIndex,
    over,
    propEq,
    set
} from "ramda";
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
    switch (action.type) {
    // Players
    case "ADD_PLAYER":
        return over(
            lensPath(["players"]),
            append(action.newPlayer),
            state
        );
    case "DEL_PLAYER":
        return over(
            lensPath(["players"]),
            filter((p) => p.id !== action.id),
            set(
                lensPath(["avoid"]),
                filter((pair) => !pair.includes(action.id)),
                state
            )
        );
    case "SET_PLAYER_MATCHCOUNT":
        return set(
            lensPath([
                "players",
                findIndex(propEq("id", action.id), state.players),
                "matchCount"
            ]),
            action.matchCount,
            state
        );
    case "SET_PLAYER_RATING":
        return set(
            lensPath([
                "players",
                findIndex(propEq("id", action.id), state.players),
                "rating"
            ]),
            action.rating,
            state
        );
    // Avoid
    case "ADD_AVOID_PAIR":
        return over(
            lensPath(["avoid"]),
            append(action.pair),
            state
        );
    case "DEL_AVOID_PAIR":
        return over(
            lensPath(["avoid"]),
            filter((pair) => !(
                pair.includes(action.pair[0])
                && pair.includes(action.pair[1])
            )),
            state
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
