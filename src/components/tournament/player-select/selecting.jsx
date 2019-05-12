import React from "react";
import {useTournament} from "../../../state/tourneys-state";
import {usePlayers} from "../../../state/player-state";

/**
 * @param {Object} props
 */
export default function Selecting({tourneyId, setIsSelecting}) {
    const [tourney, dispatch] = useTournament(tourneyId);
    const {playerState} = usePlayers();
    /** @param {React.ChangeEvent<HTMLInputElement>} event */
    function togglePlayer(event) {
        const id = Number(event.target.value);
        if (event.target.checked) {
            dispatch({
                type: "SET_TOURNEY_PLAYERS",
                players: tourney.players.concat([id]),
                tourneyId
            });
        } else {
            dispatch({
                type: "SET_TOURNEY_PLAYERS",
                players: tourney.players.filter((pId) => pId !== id),
                tourneyId
            });
        }
    }
    return (
        <div>
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
            <table>
                <caption>Select players</caption>
                <thead>
                    <tr>
                        <th>First name</th>
                        <th>Last name</th>
                        <th>Select</th>
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
                                    checked={tourney.players.includes(p.id)}
                                    onChange={togglePlayer}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
