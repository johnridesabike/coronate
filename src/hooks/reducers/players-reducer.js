import {Id, createPlayer} from "../../data-types";
import {
    assoc,
    dissoc,
    lensPath,
    lensProp,
    mergeLeft,
    over,
    set
} from "ramda";
import nanoid from "nanoid";
import t from "tcomb";

const ActionSetPlayer = t.interface({
    firstName: t.String,
    id: Id,
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
    id: Id
});
const ActionSetMatchcount = t.interface({
    id: Id,
    matchCount: t.Number
});
const ActionSetRating = t.interface({
    id: Id,
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
    const nextId = nanoid();
    switch (action.type) {
    case "ADD_PLAYER":
        return assoc(
            nextId,
            createPlayer({
                firstName: action.firstName,
                id: nextId,
                lastName: action.lastName,
                rating: action.rating
            }),
            state
        );
    case "SET_PLAYER":
        return over(
            lensProp(action.id),
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
