import {
    createContext,
    createElement,
    useContext,
    useEffect,
    useReducer
} from "react";
import {assoc} from "ramda";
import defaultOptions from "./demo-options.json";
import {localStorageOrDefault} from "./helpers";
import t from "tcomb";

const ActionLoadState = t.interface({state: t.Any});
const ActionSetByeValue = t.interface({byeValue: t.Number});
const ActionTypes = t.union([ActionLoadState, ActionSetByeValue]);
ActionTypes.dispatch = function (x) {
    const typeToConstructor = {
        "LOAD_STATE": ActionLoadState,
        "SET_BYE_VALUE": ActionSetByeValue
    };
    return typeToConstructor[x.type];
};

function reducer(state, action) {
    ActionTypes(action);
    switch (action.type) {
    case "SET_BYE_VALUE":
        return assoc("byeValue", action.byeValue, state);
    case "LOAD_STATE":
        return action.state;
    default:
        throw new Error("Unexpected action type.");
    }
}

const OptionsContext = createContext(null);

export function useOptions() {
    return useContext(OptionsContext);
}

export function OptionsProvider(props) {
    const loadedData = localStorageOrDefault("options", defaultOptions);
    const [state, dispatch] = useReducer(reducer, loadedData);
    useEffect(
        function () {
            localStorage.setItem("options", JSON.stringify(state));
        },
        [state]
    );
    return (
        createElement(
            OptionsContext.Provider,
            {value: [state, dispatch]},
            props.children
        )
    );
}
