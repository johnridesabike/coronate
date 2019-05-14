import React from "react";
import {set, lensIndex} from "ramda";
import {dummyPlayer} from "../../../../data/player";
import {useRound, usePlayers, useOptions} from "../../../../state";
import {WHITE, BLACK} from "../../../../data/constants";

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
    tourneyId = Number(tourneyId); // reach router passes a string instead.
    const {dispatch, unmatched} = useRound(tourneyId, roundId);
    const {playerState, getPlayer} = usePlayers();
    const [{byeValue}] = useOptions();
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
    if (unmatched.length % 2 !== 0) {
        unmatched.push(dummyPlayer.id);
    }
    if (unmatched.length === 0) {
        return null;
    }
    return (
        <div>
            <h3>Unmatched players</h3>
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
            </button>
            <ul>
                {unmatched.map((pId) => (
                    <li key={pId}>
                        {stagedPlayers.includes(pId)
                        ? <button disabled>Added</button>
                        : (
                            <button
                                disabled={!stagedPlayers.includes(null)}
                                onClick={() => selectPlayer(pId)}
                            >
                                Add
                            </button>
                        )
                        }
                        {" "}
                        <label htmlFor={`${pId}`}>
                            {getPlayer(pId).firstName} {getPlayer(pId).lastName}
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
}
