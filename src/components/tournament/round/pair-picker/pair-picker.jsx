import React, {useState} from "react";
import {set, lensIndex} from "ramda";
import {dummyPlayer} from "../../../../data/player";
import {useTournament, usePlayers, useOptions} from "../../../../state";
import {WHITE, BLACK} from "../../../../data/constants";
import Stage from "./stage";

/**
 * @param {Object} props
 * @param {number} props.tourneyId
 * @param {number} props.roundId
 */
export default function PairPicker({tourneyId, roundId}) {
    tourneyId = Number(tourneyId); // reach router passes a string instead.
    const [{roundList, players}, dispatch] = useTournament(tourneyId);
    // eslint-disable-next-line no-unused-vars
    const [playerState, ignore, getPlayer] = usePlayers();
    const [{byeValue}] = useOptions();
    const matchList = roundList[roundId];
    /** @type {[number, number]} */
    const defaultPlayers = [null, null];
    const [stagedPlayers, setStagedPlayers] = useState(defaultPlayers);
    /** @param {number} id */
    function selectPlayer(id) {
        if (!stagedPlayers[WHITE]) {
            setStagedPlayers(
                (prevState) => set(lensIndex(WHITE), id, prevState)
            );
        } else if (!stagedPlayers[BLACK]) {
            setStagedPlayers(
                (prevState) => set(lensIndex(BLACK), id, prevState)
            );
        }
        // else... nothing happens
    }
    const matched = matchList.reduce(
        (acc, match) => acc.concat(match.players),
        []
    );
    const unMatched = players.filter((pId) => !matched.includes(pId));
    if (unMatched.length % 2 !== 0) {
        unMatched.push(dummyPlayer.id);
    }
    if (unMatched.length === 0) {
        return null;
    }
    return (
        <div>
            <h3>Unmatched players</h3>
            <ul>
                {unMatched.map((pId) => (
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
            <button
                onClick={() => dispatch({
                    type: "AUTO_PAIR",
                    unpairedPlayers: unMatched,
                    tourneyId,
                    roundId,
                    playerState,
                    byeValue
                })}
                disabled={unMatched.length === 0}
            >
                Auto-pair
            </button>
            <Stage
                tourneyId={tourneyId}
                roundId={roundId}
                stagedPlayers={stagedPlayers}
                setStagedPlayers={setStagedPlayers}
            />
        </div>
    );
}
