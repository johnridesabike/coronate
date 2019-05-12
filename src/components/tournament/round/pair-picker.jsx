import React, {useState} from "react";
import {dummyPlayer} from "../../../data/player";
import {useTournament, usePlayers, useOptions} from "../../../state";

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
    /** @type {number[]} */
    const defaultPlayers = [];
    const [selectedPlayers, setSelectedPlayers] = useState(defaultPlayers);
    /** @param {React.ChangeEvent<HTMLInputElement>} event */
    function selectPlayer(event) {
        const pId = Number(event.target.value);
        if (event.target.checked) {
            setSelectedPlayers(function (prevState) {
                // stop React from adding an ID twice in a row
                if (!prevState.includes(pId)) {
                    prevState.push(pId);
                }
                // ensure that only the last two players stay selected.
                return prevState.slice(-2);
            });
        } else {
            setSelectedPlayers(selectedPlayers.filter((id) => id !== pId));
        }
    }
    const matched = matchList.reduce(
        (acc, match) => acc.concat(match.players),
        []
    );
    const unMatched = players.filter((pId) => !matched.includes(pId));
    if (unMatched.length === 0) {
        return null;
    }
    return (
        <div>
            <h3>Unmatched players</h3>
            <ul>
                {unMatched.map((pId) => (
                    <li key={pId}>
                        <input
                            id={`${pId}`}
                            type="checkbox"
                            checked={selectedPlayers.includes(pId)}
                            value={pId}
                            onChange={selectPlayer}
                        />{" "}
                        <label htmlFor={`${pId}`}>
                            {getPlayer(pId).firstName} {getPlayer(pId).lastName}
                        </label>
                    </li>
                ))}
                {unMatched.length % 2 !== 0 && (
                    <li>
                        <input
                            type="checkbox"
                            checked={selectedPlayers.includes(
                                dummyPlayer.id
                            )}
                            value={dummyPlayer.id}
                            onChange={selectPlayer}
                        />
                        {dummyPlayer.firstName} {dummyPlayer.lastName}
                    </li>
                )}
            </ul>
            <button
                onClick={() => dispatch({
                    type: "MANUAL_PAIR",
                    pair: selectedPlayers,
                    tourneyId,
                    roundId,
                    byeValue,
                    players: playerState.players
                })}
                disabled={selectedPlayers.length !== 2}
            >
                Pair checked
            </button>{" "}
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
        </div>
    );
}
