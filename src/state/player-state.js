import {
    createContext,
    createElement,
    useContext,
    useReducer,
    useEffect
} from "react";
import {
    append,
    assoc,
    curry,
    head,
    inc,
    lensPath,
    lensIndex,
    filter,
    findIndex,
    map,
    mergeLeft,
    over,
    pipe,
    propEq,
    set,
    sort
} from "ramda";
import t from "tcomb";
import {localStorageOrDefault} from "./helpers";
import {getPlayerById} from "../pairing-scoring/helpers";
import {createPlayer} from "../factories";
import demoPlayers from "./demo-players.json";

const defaultPlayers = {
    players: demoPlayers.playerList.map((p) => createPlayer(p)),
    avoid: demoPlayers.avoidList
};

const ActionSetPlayer = t.interface({
    firstName: t.String,
    lastName: t.String,
    rating: t.Number,
    matchCount: t.Number,
    id: t.Number
});
const ActionAddPlayer = t.interface({
    firstName: t.String,
    lastName: t.String,
    rating: t.Number
});
const ActionDelPlayer = t.interface({
    id: t.Number
});
const ActionSetMatchcount = t.interface({
    id: t.Number,
    matchCount: t.Number
});
const ActionSetRating = t.interface({
    id: t.Number,
    rating: t.Number
});
const ActionAvoidPair = t.interface({
    pair: t.tuple([t.Number, t.Number])
});
const ActionLoadState = t.interface({state: t.Any});
const ActionTypes = t.union([
    ActionSetPlayer,
    ActionAddPlayer,
    ActionDelPlayer,
    ActionSetMatchcount,
    ActionSetRating,
    ActionAvoidPair,
    ActionLoadState
]);
ActionTypes.dispatch = function (x) {
    const typeToConstructor = {
        "SET_PLAYER": ActionSetPlayer,
        "ADD_PLAYER": ActionAddPlayer,
        "DEL_PLAYER": ActionDelPlayer,
        "SET_PLAYER_MATCHCOUNT": ActionSetMatchcount,
        "SET_PLAYER_RATING": ActionSetRating,
        "ADD_AVOID_PAIR": ActionAvoidPair,
        "DEL_AVOID_PAIR": ActionAvoidPair,
        "LOAD_STATE": ActionLoadState
    };
    return typeToConstructor[x.type];
};

/**
 * @param {typeof defaultPlayers} state
 * @param {PlayerAction} action
 */
function playersReducer(state, action ) {
    ActionTypes(action);
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
    case "SET_PLAYER":
        return assoc(
            "players",
            over(
                lensIndex(findIndex(propEq("id", action.id), state.players)),
                mergeLeft(
                    {
                        firstName: action.firstName,
                        lastName: action.lastName,
                        rating: action.rating,
                        matchCount: action.matchCount
                    }
                ),
                state.players
            ),
            state
        );
    case "DEL_PLAYER":
        return pipe(
            over(
                lensPath(["avoid"]),
                filter((pair) => !pair.includes(action.id)),
            ),
            over(
                lensPath(["players"]),
                filter((p) => p.id !== action.id),
            )
        )(state);
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
    case "LOAD_STATE":
        return action.state;
    default:
        throw new Error("Unexpected action type");
    }
}

const PlayerContext = createContext(null);

export function usePlayers() {
    const [playerState, playerDispatch] = useContext(PlayerContext);
    const getPlayer = curry(getPlayerById)(playerState.players);
    return {playerState, playerDispatch, getPlayer};
}

export function PlayersProvider(props) {
    const loadedData = localStorageOrDefault("players", defaultPlayers);
    const [state, dispatch] = useReducer(playersReducer, loadedData);
    useEffect(
        function () {
            localStorage.setItem("players", JSON.stringify(state));
        },
        [state]
    );
    return (
        createElement(
            PlayerContext.Provider,
            {value: [state, dispatch]},
            props.children
        )
    );
}
