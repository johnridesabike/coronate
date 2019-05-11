import React, {useState} from "react";
import curry from "ramda/src/curry";
import {getPlayerById} from "../../data/player";
import {hasHadBye} from "../../pairing-scoring/scoring";
import {useData} from "../../state/global-state";
import {usePlayers} from "../../state/player-state";

/**
 * @param {Object} props
 * @param {number} props.tourneyId
 */
export default function PlayerSelect({tourneyId}) {
    const {data, dispatch} = useData();
    const {playerState} = usePlayers();
    const getPlayer = curry(getPlayerById)(playerState.players);
    const players = data.tourneys[tourneyId].players;
    const tourney = data.tourneys[tourneyId];
    const [isSelecting, setIsSelecting] = useState(players.length === 0);
    /** @param {React.ChangeEvent<HTMLInputElement>} event */
    function togglePlayer(event) {
        const id = Number(event.target.value);
        if (event.target.checked) {
            dispatch({
                type: "SET_TOURNEY_PLAYERS",
                players: players.concat([id]),
                tourneyId
            });
        } else {
            dispatch({
                type: "SET_TOURNEY_PLAYERS",
                players: players.filter((pId) => pId !== id),
                tourneyId
            });
        }
    }
    if (isSelecting) {
        return (
            <table>
                <caption>Select players</caption>
                <thead>
                    <tr>
                        <th>First name</th>
                        <th>Last name</th>
                        <th />
                    </tr>
                </thead>
                <tbody>
                    {playerState.players.map((p) => (
                        <tr key={p.id}>
                            <td>{p.firstName}</td>
                            <td>{p.lastName}</td>
                            <td>
                                <input
                                    type="checkbox"
                                    value={p.id}
                                    checked={players.includes(p.id)}
                                    onChange={togglePlayer}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={3}>
                            <button
                                onClick={() =>
                                    dispatch({
                                        type: "SET_TOURNEY_PLAYERS",
                                        players: playerState.players.map(
                                            (p) => p.id
                                        ),
                                        tourneyId
                                    })
                                }
                            >
                                Select all
                            </button>
                            <button
                                onClick={() =>
                                    dispatch({
                                        type: "SET_TOURNEY_PLAYERS",
                                        players: [],
                                        tourneyId
                                    })
                                }
                            >
                                Select none
                            </button>
                            <button onClick={() => setIsSelecting(false)}>
                                Done
                            </button>
                        </td>
                    </tr>
                </tfoot>
            </table>
        );
    } else {
        return (
            <div>
                <table>
                    <thead>
                        <tr>
                            <th>First name</th>
                            <th>Last name</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {players.map((pId) => (
                            <tr
                                key={pId}
                                className={getPlayer(pId).type + " player"}
                            >
                                <td>{getPlayer(pId).firstName}</td>
                                <td>{getPlayer(pId).lastName}</td>
                                <td>
                                    <button
                                        onClick={() =>
                                            dispatch({
                                                type: "SET_BYE_QUEUE",
                                                // eslint-disable-next-line max-len
                                                byeQueue: tourney.byeQueue.concat(
                                                    [pId]
                                                ),
                                                tourneyId
                                            })
                                        }
                                        disabled={tourney.byeQueue.includes(
                                            pId
                                        )}
                                    >
                                        Bye signup
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button onClick={() => setIsSelecting(true)}>
                    Edit player roster
                </button>
                <h3>Bye queue</h3>
                <ol>
                    {tourney.byeQueue.map((pId) => (
                        <li
                            key={pId}
                            className={
                                hasHadBye(pId, tourney.roundList)
                                    ? "disabled"
                                    : ""
                            }
                        >
                            {getPlayer(pId).firstName}{" "}
                            {getPlayer(pId).lastName}
                            <button
                                onClick={() =>
                                    dispatch({
                                        type: "SET_BYE_QUEUE",
                                        byeQueue: tourney.byeQueue.filter(
                                            (id) => pId !== id
                                        ),
                                        tourneyId
                                    })
                                }
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ol>
            </div>
        );
    }
}
