import {BLACK, WHITE} from "../../../data-types";
import {lensIndex, set} from "ramda";
import Hidden from "@reach/visually-hidden";
import Icons from "../../../components/icons";
import PropTypes from "prop-types";
import React from "react";

export default function SelectList({
    stagedPlayers,
    setStagedPlayers,
    unmatched
}) {
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
        <ul className="content plain-list">
            {Object.values(unmatched).map(
                ({id, firstName, lastName}) => (
                    <li key={id}>
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
                        {" "}
                        {firstName} {lastName}
                    </li>
                )
            )}
        </ul>
    );
}
SelectList.propTypes = {
    setStagedPlayers: PropTypes.func,
    stagedPlayers: PropTypes.arrayOf(PropTypes.string),
    unmatched: PropTypes.object
};
