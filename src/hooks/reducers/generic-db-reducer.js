import {createPlayer, createTournament, types} from "../../data-types";
import nanoid from "nanoid";
import t from "tcomb";

// eslint-disable-next-line complexity
export default function genericDbReducer(state, action) {
    const nextId = nanoid();
    const nextState = {};
    switch (action.type) {
    case "ADD_ITEM":
        console.warn("Use a more specific action instead, please.");
        nextState[nextId] = action.item;
        return {...state, ...nextState};
    case "ADD_TOURNEY":
        t.interface({name: t.String})(action);
        nextState[nextId] = createTournament({id: nextId, name: action.name});
        return {...state, ...nextState};
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
        return {...state, ...nextState};
    case "DEL_ITEM":
        // If using the player DB, be sure to delete avoid-pairs too.
        t.interface({id: t.String})(action);
        delete state[action.id];
        return {...state};
    case "SET_PLAYER":
        // This is copied from players-reducer since the profile editor uses it
        // TODO: unify those
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
        return {...state, ...nextState};
    case "LOAD_STATE":
        return action.state;
    default:
        throw new Error("Unexpected action type");
    }
}
