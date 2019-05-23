import {
    assoc,
    dissoc,
    head,
    inc,
    keys,
    lensPath,
    lensProp,
    map,
    mergeLeft,
    over,
    pipe,
    set,
    sort
} from "ramda";
import {createPlayer} from "../../data-types";
import t from "tcomb";

const ActionSetPlayer = t.interface({
    firstName: t.String,
    id: t.Number,
    lastName: t.String,
    matchCount: t.Number,
    rating: t.Number
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
        "ADD_AVOID_PAIR": ActionAvoidPair,
        "ADD_PLAYER": ActionAddPlayer,
        "DEL_AVOID_PAIR": ActionAvoidPair,
        "DEL_PLAYER": ActionDelPlayer,
        "LOAD_STATE": ActionLoadState,
        "SET_PLAYER": ActionSetPlayer,
        "SET_PLAYER_MATCHCOUNT": ActionSetMatchcount,
        "SET_PLAYER_RATING": ActionSetRating
    };
    return typeToConstructor[x.type];
};

export default function playersReducer(state, action) {
    ActionTypes(action);
    const getNextId = pipe(
        keys,
        map((id) => Number(id)),
        sort((a, b) => b - a),
        head,
        inc
    );
    switch (action.type) {
    case "ADD_PLAYER":
        return assoc(
            getNextId(state.players),
            createPlayer({
                firstName: action.firstName,
                id: getNextId(state.players),
                lastName: action.lastName,
                rating: action.rating
            }),
            state
        );
    case "SET_PLAYER":
        return over(
            lensProp(String(action.id)),
            mergeLeft(
                {
                    firstName: action.firstName,
                    lastName: action.lastName,
                    matchCount: action.matchCount,
                    rating: action.rating
                }
            ),
            state
        );
    case "DEL_PLAYER":
        // TODO: Make this clean the avoidlist too
        return dissoc(
            lensPath(String(action.id)),
            state
        );
    case "SET_PLAYER_MATCHCOUNT":
        return set(
            lensPath([String(action.id), "matchCount"]),
            action.matchCount,
            state
        );
    case "SET_PLAYER_RATING":
        return set(
            lensPath([String(action.id), "rating"]),
            action.rating,
            state
        );
    case "LOAD_STATE":
        return action.state;
    default:
        throw new Error("Unexpected action type");
    }
}
