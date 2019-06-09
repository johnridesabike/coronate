import {ascend, descend, prop, sort} from "ramda";
import {useEffect, useState} from "react";
import t from "tcomb";

export function useSortedTable(origTable, defaultKey, defaultDescend = true) {
    const [table, setTable] = useState(origTable);
    const [key, setKey] = useState(defaultKey);
    const [isDescending, setIsDescending] = useState(defaultDescend);
    function toggleDirection() {
        setIsDescending(!isDescending);
    }
    useEffect(
        function () {
            const direction = (isDescending) ? descend : ascend;
            setTable(sort(direction(prop(key)), origTable));
        },
        [origTable, key, isDescending]
    );
    return {
        isDescending,
        key,
        setIsDescending,
        setKey,
        setTable,
        table,
        toggleDirection
    };
}

export function useDocumentTitle(title) {
    useEffect(
        function () {
            const origTitle = document.title;
            document.title = "Chessahoochee: " + title;
            return function () {
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
