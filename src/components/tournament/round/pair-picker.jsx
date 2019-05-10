import React, {useState, useContext} from "react";
import "@reach/menu-button/styles.css";
import curry from "ramda/src/curry";
import {getPlayerById, dummyPlayer} from "../../../data/player";
import {DataContext} from "../../../state/global-state";

/**
 * @param {Object} props
 * @param {number} props.tourneyId
 * @param {number} props.roundId
 */
export default function PairPicker({tourneyId, roundId}) {
    const {data, dispatch} = useContext(DataContext);
    const getPlayer = curry(getPlayerById)(data.players);
    const tourney = data.tourneys[tourneyId];
    const matchList = tourney.roundList[roundId];
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
    const unMatched = tourney.players.filter((pId) => !matched.includes(pId));
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
                    roundId
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
                    roundId
                })}
                disabled={unMatched.length === 0}
            >
                Auto-pair
            </button>
        </div>
    );
}
