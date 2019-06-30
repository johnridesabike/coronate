import t from "tcomb";
import {types} from "../../data-types";

// eslint-disable-next-line complexity
export default function optionsReducer(state, action) {
    const nextState = {};
    switch (action.type) {
    case "ADD_AVOID_PAIR":
        t.interface({pair: types.AvoidPair})(action);
        nextState.avoidPairs = state.avoidPairs.concat([action.pair]);
        break;
    case "DEL_AVOID_PAIR":
        t.interface({pair: types.AvoidPair})(action);
        nextState.avoidPairs = state.avoidPairs.filter(
            (x) => !(x.includes(action.pair[0]) && x.includes(action.pair[1]))
        );
        break;
    case "DEL_AVOID_SINGLE":
        t.interface({id: types.Id})(action);
        // call this when you delete a player ID
        // TODO: make the avoidPairs list smartly auto-clean itself
        nextState.avoidPairs = state.avoidPairs.filter(
            (x) => !x.includes(action.id)
        );
        break;
    case "SET_OPTION":
        t.interface({
            option: t.String,
            value: t.union([
                t.Number,
                t.list(types.AvoidPair),
                Date
            ])
        })(action);
        nextState[action.option] = action.value;
        break;
    case "LOAD_STATE":
        return action.state;
    default:
        throw new Error("Unexpected action type.");
    }
    return {...state, ...nextState};
}

