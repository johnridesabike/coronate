import {createContext, createElement, useContext, useReducer} from "react";
// This will cause Webpack to import the entire Ramda library, but we're using
// so much of it that cherry-picking individual files has virtually no benefit.
import {
    append,
    curry,
    lensPath,
    filter,
    findIndex,
    over,
    propEq,
    set
} from "ramda";
import {createPlayer, getPlayerById} from "../data/player";
import demoPlayers from "./demo-players.json";
/**
 * @typedef {import("./dispatch").Action} Action
 * @typedef {import("../data/index").Player} Player
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

/** @type {[typeof defaultPlayers, React.Dispatch<PlayerAction>]} */
const defaultContext = null;
const PlayerContext = createContext(defaultContext);

/**
 * @returns {[typeof defaultPlayers, React.Dispatch<PlayerAction>, Curry.Curry<(id: number) => Player>]}
 */
export function usePlayers() {
    const [state, dispatch] = useContext(PlayerContext);
    const getPlayer = curry(getPlayerById)(state.players);
    return [state, dispatch, getPlayer];
}

/**
 * @param {Object} props
 */
export function PlayersProvider(props) {
    const [state, dispatch] = useReducer(playersReducer, defaultPlayers);
    return (
        createElement(
            PlayerContext.Provider,
            {value: [state, dispatch]},
            props.children
        )
    );
}
