import {append, assoc, filter, lensProp, over} from "ramda";
import {AvoidPair} from "../../data-types";
import t from "tcomb";

const ActionLoadState = t.interface({
    state: t.Any
});
const ActionSetOption = t.interface({
    option: t.String,
    value: t.union([
        t.Number,
        t.list(AvoidPair)
    ])
});
const ActionAvoidPair = t.interface({
    pair: AvoidPair
});
const ActionTypes = t.union([
    ActionLoadState,
    ActionAvoidPair
]);
ActionTypes.dispatch = function (x) {
    const typeToConstructor = {
        "ADD_AVOID_PAIR": ActionAvoidPair,
        "DEL_AVOID_PAIR": ActionAvoidPair,
        "LOAD_STATE": ActionLoadState,
        "SET_OPTION": ActionSetOption
    };
    return typeToConstructor[x.type];
};

export default function optionsReducer(state, action) {
    ActionTypes(action);
    switch (action.type) {
    case "ADD_AVOID_PAIR":
        return over(
            lensProp("avoidPairs"),
            append(action.pair),
            state
        );
    case "DEL_AVOID_PAIR":
        return over(
            lensProp("avoidPairs"),
            filter((pair) => !(
                pair.includes(action.pair[0])
                && pair.includes(action.pair[1])
            )),
            state
        );
    case "SET_OPTION":
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

