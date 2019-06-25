import {append, assoc, filter, lensProp, over} from "ramda";
import t from "tcomb";
import {types} from "../../data-types";

// eslint-disable-next-line complexity
export default function optionsReducer(state, action) {
    switch (action.type) {
    case "ADD_AVOID_PAIR":
        t.interface({pair: types.AvoidPair})(action);
        return over(
            lensProp("avoidPairs"),
            append(action.pair),
            state
        );
    case "DEL_AVOID_PAIR":
        t.interface({pair: types.AvoidPair})(action);
        return over(
            lensProp("avoidPairs"),
            filter((pair) => !(
                pair.includes(action.pair[0]) && pair.includes(action.pair[1])
            )),
            state
        );
    case "DEL_AVOID_SINGLE":
        t.interface({id: types.Id})(action);
        // call this when you delete a player ID
        // TODO: make the avoidPairs list smartly auto-clean itself
        return over(
            lensProp("avoidPairs"),
            filter((pair) => !pair.includes(action.id)),
            state
        );
    case "SET_OPTION":
        t.interface({
            option: t.String,
            value: t.union([
                t.Number,
                t.list(types.AvoidPair),
                Date
            ])
        })(action);
        return assoc(
            action.option,
            action.value,
            state
        );
    case "LOAD_STATE":
        return action.state;
    default:
        throw new Error("Unexpected action type.");
    }
}

