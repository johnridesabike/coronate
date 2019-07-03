import React, {useEffect} from "react";
import PropTypes from "prop-types";
import numeral from "numeral";
import VisuallyHidden from "@reach/visually-hidden";
import Hidden from "@reach/visually-hidden";
import {BLACK, WHITE} from "../../../data-types";
import {calcPairIdeal, maxPriority} from "../../../Pairing.bs";
import Icons from "../../../components/icons";
import {SortButton} from "../../../components/utility";
import {useSortedTable} from "../../../hooks";

function setIndex(index, value) {
    return function (arr) {
        const copy = arr.slice();
        copy[index] = value;
        return copy;
    };
}

export default function SelectList({
    pairData,
    stagedPlayers,
    setStagedPlayers,
    unmatched
}) {
    const initialTable = Object.values(unmatched);
    const [sorted, sortedDispatch] = useSortedTable(initialTable, "firstName");
    const isOnePlayerSelected = (
        new Set(stagedPlayers).size === 2
        && stagedPlayers.includes(null)
    );
    useEffect(
        function hydrateIdealToTable() {
            function calcIdealOrNot(player) {
                const selectedIds = stagedPlayers.filter((p) => p !== null);
                if (selectedIds.length !== 1) {
                    return 0;
                }
                const selectedPlayer = pairData[selectedIds[0]];
                if (!player || !selectedPlayer) {
                    return 0; // if it's a bye player
                }
                return calcPairIdeal(selectedPlayer, player) / maxPriority;
            }
            const table = Object.values(unmatched).map(
                (data) => (
                    {...data, ...{ideal: calcIdealOrNot(pairData[data.id])}}
                ),
                []
            );
            sortedDispatch({table});
        },
        [unmatched, pairData, sortedDispatch, stagedPlayers]
    );
    // only use unmatched players if this is the last round.
    function selectPlayer(id) {
        const setWhite = setIndex(WHITE, id);
        const setBlack = setIndex(BLACK, id);
        if (stagedPlayers[WHITE] === null) {
            setStagedPlayers((prevState) => setWhite(prevState));
        } else if (stagedPlayers[BLACK] === null) {
            setStagedPlayers((prevState) => setBlack(prevState));
        }
        // else... nothing happens
    }
    if (Object.keys(unmatched).length === 0) {
        return null;
    }
    return (
        <table className="content">
            <thead>
                <tr>
                    <th>
                        <VisuallyHidden>Controls</VisuallyHidden>
                    </th>
                    <th>
                        <SortButton
                            sortKey="firstName"
                            data={sorted}
                            dispatch={sortedDispatch}
                        >
                            Name
                        </SortButton>
                    </th>
                    <th>
                        <SortButton
                            sortKey="ideal"
                            data={sorted}
                            dispatch={sortedDispatch}
                        >
                            Ideal
                        </SortButton>
                    </th>
                </tr>
            </thead>
            <tbody>
                {sorted.table.map(({id, firstName, lastName, ideal}) =>
                    <tr key={id}>
                        <td>
                            <button
                                className="button-ghost"
                                disabled={
                                    !stagedPlayers.includes(null)
                                    || stagedPlayers.includes(id)
                                }
                                onClick={() => selectPlayer(id)}
                            >
                                <Icons.UserPlus/>
                                <Hidden>
                                    Add {firstName} {lastName}
                                </Hidden>
                            </button>
                        </td>
                        <td>
                            {firstName} {lastName}
                        </td>
                        <td>
                            {isOnePlayerSelected
                            ? numeral(ideal).format("%")
                            : "-"}
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}
SelectList.propTypes = {
    pairData: PropTypes.object,
    setStagedPlayers: PropTypes.func,
    stagedPlayers: PropTypes.arrayOf(PropTypes.string),
    unmatched: PropTypes.object
};
