import React from "react";
import {lensPath, set} from "ramda";
import defaultOptions from "./demo-options.json";
/**
 * @typedef {import("./dispatch").OptionAction} OptionAction
 */

/**
 * @param {typeof defaultOptions} state
 * @param {OptionAction} action
 */
function reducer(state, action) {
    switch (action.type) {
    case "SET_BYE_VALUE":
        return set(
            lensPath(["byeValue"]),
            action.byeValue,
            state
        );
    default:
        throw new Error("Unexpected action type " + action.type);
    }
}

/** @type {[typeof defaultOptions, React.Dispatch<OptionAction>]} */
const defaultContext = null;
const OptionsContext = React.createContext(defaultContext);

function useOptionsReducer() {
    return React.useReducer(reducer, defaultOptions);
}


export function useOptions() {
    return React.useContext(OptionsContext);
}

/**
 * @param {Object} props
 */
export function OptionsProvider(props) {
    const [data, dispatch] = useOptionsReducer();
    return (
        <OptionsContext.Provider value={[data, dispatch]}>
            {props.children}
        </OptionsContext.Provider>
    );
}
