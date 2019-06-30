import {ascend, descend, pipe, sort} from "ramda";
import {useEffect, useReducer} from "react";
// import t from "tcomb";

const toLowerCaseIfPossible = (x) => x.toLowerCase ? x.toLowerCase() : x;

function sortedTableReducer(oldState, newState) {
    const {isDescending, key, table} = {...oldState, ...newState};
    const direction = isDescending ? descend : ascend;
    const caseInsensitiveProp = pipe((x) => x[key], toLowerCaseIfPossible);
    const sortFunc = sort(direction(caseInsensitiveProp));
    return {isDescending, key, table: sortFunc(table)};
}

export function useSortedTable(table, key, isDescending = true) {
    const initialState = {isDescending, key, table};
    const [state, dispatch] = useReducer(sortedTableReducer, initialState);
    useEffect(
        function callDispatchOnceToTriggerInitialSort() {
            dispatch({});
        },
        []
    );
    return [state, dispatch];
}

export function useLoadingCursor(isLoaded) {
    useEffect(
        function () {
            if (isLoaded) {
                document.body.style.cursor = "auto";
            } else {
                document.body.style.cursor = "wait";
            }
            // Just in case the component unmounts before the data loads.
            return function () {
                document.body.style.cursor = "auto";
            };
        },
        [isLoaded]
    );
}
