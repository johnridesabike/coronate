import {createPlayer, types} from "../../../data-types";
import nanoid from "nanoid";
import t from "tcomb";

// eslint-disable-next-line complexity
export default function playersReducer(state, action) {
    const nextId = nanoid();
    const nextState = {};
    switch (action.type) {
    case "ADD_PLAYER":
        t.interface({
            firstName: t.String,
            lastName: t.String,
            rating: t.Number
        })(action);
        nextState[nextId] = createPlayer({
            firstName: action.firstName,
            id: nextId,
            lastName: action.lastName,
            rating: action.rating
        });
        break;
    case "SET_PLAYER":
        t.interface({
            firstName: t.String,
            id: types.Id,
            lastName: t.String,
            matchCount: t.Number,
            rating: t.Number
        })(action);
        nextState[action.id] = {
            ...state[action.id],
            ...{
                firstName: action.firstName,
                lastName: action.lastName,
                matchCount: action.matchCount,
                rating: action.rating
            }
        };
        break;
    case "DEL_PLAYER":
        // You should delete all avoid-pairs with the id too.
        t.interface({id: types.Id})(action);
        delete state[action.id];
        return {...state};
    case "SET_PLAYER_MATCHCOUNT":
        t.interface({
            id: types.Id,
            matchCount: t.Number
        })(action);
        nextState[action.id] = {...state[action.id]};
        nextState[action.id].matchCount = action.matchCount;
        break;
    case "SET_PLAYER_RATING":
        t.interface({id: types.Id, rating: t.Number})(action);
        nextState[action.id] = {...state[action.id]};
        nextState[action.id].rating = action.rating;
        break;
    case "LOAD_STATE":
        return action.state;
    default:
        throw new Error("Unexpected action type");
    }
    return {...state, ...nextState};
}
