import {
    assoc,
    dissoc,
    lensPath,
    lensProp,
    mergeLeft,
    over,
    set
} from "ramda";
import {createPlayer, types} from "../../../data-types";
import nanoid from "nanoid";
import t from "tcomb";

// eslint-disable-next-line complexity
export default function playersReducer(state, action) {
    const nextId = nanoid();
    switch (action.type) {
    case "ADD_PLAYER":
        t.interface({
            firstName: t.String,
            lastName: t.String,
            rating: t.Number
        })(action);
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
        t.interface({
            firstName: t.String,
            id: types.Id,
            lastName: t.String,
            matchCount: t.Number,
            rating: t.Number
        })(action);
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
        // You should delete all avoid-pairs with the id too.
        t.interface({id: types.Id})(action);
        return dissoc(
            lensPath(action.id),
            state
        );
    case "SET_PLAYER_MATCHCOUNT":
        t.interface({
            id: types.Id,
            matchCount: t.Number
        })(action);
        return set(
            lensPath([action.id, "matchCount"]),
            action.matchCount,
            state
        );
    case "SET_PLAYER_RATING":
        t.interface({id: types.Id, rating: t.Number})(action);
        return set(
            lensPath([action.id, "rating"]),
            action.rating,
            state
        );
    case "LOAD_STATE":
        return action.state;
    default:
        throw new Error("Unexpected action type");
    }
}
