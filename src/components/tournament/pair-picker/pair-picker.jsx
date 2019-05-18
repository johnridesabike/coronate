import React, {useState} from "react";
import {set, lensIndex, append} from "ramda";
import {Dialog} from "@reach/dialog";
import Hidden from "@reach/visually-hidden";
import UserPlus from "react-feather/dist/icons/user-plus";
import Selecting from "../player-select/selecting";
import {useRound, usePlayers, useOptions} from "../../../state";
import {WHITE, BLACK, DUMMY_ID} from "../../../pairing-scoring/constants";

/**
 * @param {Object} props
 * @param {number} props.tourneyId
 * @param {number} props.roundId
 * @param {[number, number]} props.stagedPlayers
 * @param {React.Dispatch<React.SetStateAction<[number, number]>>} props.setStagedPlayers
 */
export default function PairPicker({
    tourneyId,
    roundId,
    stagedPlayers,
    setStagedPlayers
}) {
    const {dispatch, unmatched} = useRound(tourneyId, roundId);
    const {playerState, getPlayer} = usePlayers();
    const [{byeValue}] = useOptions();
    const [isModalOpen, setIsModalOpen] = useState(false);
    /** @param {number} id */
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
                                <UserPlus/>
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
