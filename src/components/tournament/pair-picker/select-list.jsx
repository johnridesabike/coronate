import React, {useState} from "react";
import PropTypes from "prop-types";
import {set, lensIndex, append} from "ramda";
import {Dialog} from "@reach/dialog";
import Hidden from "@reach/visually-hidden";
import Icons from "../../icons";
import Selecting from "../player-select/selecting";
import {useRound, usePlayers} from "../../../state";
import {useOption} from "../../../hooks";
import {WHITE, BLACK, DUMMY_ID} from "../../../data-types";

export default function SelectList({
    tourneyId,
    roundId,
    stagedPlayers,
    setStagedPlayers
}) {
    const {dispatch, unmatched} = useRound(tourneyId, roundId);
    const {playerState, getPlayer} = usePlayers();
    const [byeValue] = useOption("byeValue", 1);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    // make a new list so as not to affect auto-pairing
    const unmatchedWithDummy = (
        (unmatched.length % 2 !== 0)
        ? append(DUMMY_ID, unmatched)
        : unmatched
    );
    if (unmatched.length === 0) {
        return null;
    }
    return (
        <div>
            <button
                onClick={() => dispatch({
                    type: "AUTO_PAIR",
                    unpairedPlayers: unmatched,
                    tourneyId,
                    roundId,
                    playerState,
                    byeValue
                })}
                disabled={unmatched.length === 0}
            >
                Auto-pair unmatched players
            </button><br/>
            <button onClick={() => setIsModalOpen(true)}>
                Add or remove players from the roster.
            </button>
            <ul>
                {unmatchedWithDummy.map((pId) => (
                    <li key={pId}>
                        {stagedPlayers.includes(pId)
                        ? <button disabled>Selected</button>
                        : (
                            <button
                                disabled={!stagedPlayers.includes(null)}
                                onClick={() => selectPlayer(pId)}
                            >
                                <Icons.UserPlus/>
                                <Hidden>
                                    Select {getPlayer(pId).firstName}{" "}
                                    {getPlayer(pId).lastName}
                                </Hidden>
                            </button>
                        )}{" "}
                        {getPlayer(pId).firstName} {getPlayer(pId).lastName}
                    </li>
                ))}
            </ul>
            <Dialog isOpen={isModalOpen}>
                <button onClick={() => setIsModalOpen(false)}>Done</button>
                <Selecting tourneyId={tourneyId} />
            </Dialog>
        </div>
    );
}
SelectList.propTypes = {
    tourneyId: PropTypes.number,
    roundId: PropTypes.number,
    stagedPlayers: PropTypes.arrayOf(PropTypes.number),
    setStagedPlayers: PropTypes.func
};
