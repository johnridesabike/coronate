import {createContext, createElement, useContext, useReducer} from "react";
// This will cause Webpack to import the entire Ramda library, but we're using
// so much of it that cherry-picking individual files has virtually no benefit.
import {
    append,
    curry,
    head,
    inc,
    lensPath,
    filter,
    findIndex,
    map,
    over,
    pipe,
    propEq,
    set,
    sort
} from "ramda";
import {getPlayerById} from "../data/player";
import {createPlayer} from "../data/factories";
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
    // @ts-ignore
    const getNextId = pipe(map((p) => p.id), sort((a, b) => b - a), head, inc);
    switch (action.type) {
    case "ADD_PLAYER":
        return over(
            lensPath(["players"]),
            append(createPlayer({
                firstName: action.firstName,
                lastName: action.lastName,
                rating: action.rating,
                id: getNextId(state.players)
            })),
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

export function usePlayers() {
    const [playerState, playerDispatch] = useContext(PlayerContext);
    const getPlayer = curry(getPlayerById)(playerState.players);
    return {playerState, playerDispatch, getPlayer};
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
