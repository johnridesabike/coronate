// @ts-check
import {createContext} from "react";
import defaultOptions from "./demo-options.json";

function optionsReducer(state, action) {
    switch (action.type) {
    case "SET_BYE_VALUE":
        return Object.assign(
            {},
            state,
            {byeValue: action.byeValue}
        );
    default:
        throw new Error("Unexpected action type");
    }
}
Object.freeze(optionsReducer);
export {defaultOptions, optionsReducer};

const DataContext = createContext(null);
export {DataContext};