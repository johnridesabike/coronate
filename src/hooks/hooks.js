import {ascend, descend, prop, sort} from "ramda";
import {useEffect, useReducer} from "react";
import t from "tcomb";

function sortedTableReducer(oldState, newState) {
    const {isDescending, key, table} = Object.assign({}, oldState, newState);
    const sortDirection = (isDescending) ? descend : ascend;
    const sortTable = sort(sortDirection(prop(key)));
    return {isDescending, key, table: sortTable(table)};
}

export function useSortedTable(table, key, isDescending = true) {
    return useReducer(sortedTableReducer, {isDescending, key, table});
}

export function useDocumentTitle(title) {
    useEffect(
        function () {
            const origTitle = document.title;
            document.title = "Chessahoochee: " + title;
            return function resetTitle() {
                document.title = origTitle;
            };
        },
        [title]
    );
}

export function useLoadingCursor(isLoaded) {
    useEffect(
        function () {
            if (t.Boolean(isLoaded)) {
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
