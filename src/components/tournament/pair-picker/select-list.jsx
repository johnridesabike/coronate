import {BLACK, DUMMY_ID, WHITE, dummyPlayer} from "../../../data-types";
import {assoc, lensIndex, set} from "ramda";
import Hidden from "@reach/visually-hidden";
import Icons from "../../icons";
import PropTypes from "prop-types";
import React from "react";
import {getUnmatched} from "../../../pairing-scoring";
import {useTournament} from "../../../hooks";

export default function SelectList({roundId, stagedPlayers, setStagedPlayers}) {
    const {tourney, players} = useTournament();
    // only use unmatched players if this is the last round.
    const unmatched = (roundId === tourney.roundList.length - 1)
        ? getUnmatched(tourney, players, roundId)
        : {};

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

    const unmatchedCount = Object.keys(unmatched).length;

    // make a new list so as not to affect auto-pairing
    const unmatchedWithDummy = (
        (unmatchedCount % 2 !== 0)
        ? assoc(DUMMY_ID, dummyPlayer, unmatched)
        : unmatched
    );
    if (unmatchedCount === 0) {
        return null;
    }
    return (
        <div>
            <ul className="content plain-list">
                {Object.values(unmatchedWithDummy).map(
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
                                    Select {firstName} {lastName}
                                </Hidden>
                            </button>
                            {" "}
                            {firstName} {lastName}
                        </li>
                    )
                )}
            </ul>
        </div>
    );
}
SelectList.propTypes = {
    roundId: PropTypes.number,
    setStagedPlayers: PropTypes.func,
    stagedPlayers: PropTypes.arrayOf(PropTypes.string)
};
