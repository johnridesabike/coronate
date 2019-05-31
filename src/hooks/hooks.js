import {ascend, descend, prop, sort} from "ramda";
import {useEffect, useState} from "react";

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
