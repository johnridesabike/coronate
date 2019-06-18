import {BLACK, WHITE} from "../../../data-types";
import {assoc, lensIndex, set} from "ramda";
import {
    calcPairIdeal,
    maxPriority
} from "../../../pairing-scoring";
import Hidden from "@reach/visually-hidden";
import Icons from "../../../components/icons";
import PropTypes from "prop-types";
import React from "react";
import VisuallyHidden from "@reach/visually-hidden";
import numeral from "numeral";
// import useSortedTable from "../../../hooks";

export default function SelectList({
    pairData,
    stagedPlayers,
    setStagedPlayers,
    unmatched
}) {
    function calcIdealOrNot(player) {
        const selectedIds = stagedPlayers.filter((p) => p !== null);
        if (selectedIds.length !== 1) {
            return "-";
        }
        const selectedPlayer = pairData[selectedIds[0]];
        return numeral(
            calcPairIdeal(selectedPlayer, player) / maxPriority
        ).format("%");
    }

    // const [sorted, sortedDispatch] = useSortedTable(Object.values(unmatched), "name");
    const idealsObj = (function () {
        return Object.values(pairData).reduce(
            (acc, value) => assoc(value.id, calcIdealOrNot(value), acc),
            {}
        );
    }());
    // only use unmatched players if this is the last round.
    function selectPlayer(id) {
        if (stagedPlayers[WHITE] === null) {
            setStagedPlayers(
                (prevState) => set(lensIndex(WHITE), id, prevState)
            );
        } else if (stagedPlayers[BLACK] === null) {
            setStagedPlayers(
                (prevState) => set(lensIndex(BLACK), id, prevState)
            );
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
                        Name
                    </th>
                    <th>
                        Match ideal
                    </th>
                </tr>
            </thead>
            <tbody>
                {Object.values(unmatched).map(({id, firstName, lastName}) =>
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
                            {idealsObj[id]}
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
