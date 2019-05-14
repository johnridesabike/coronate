import React from "react";
import {useTournament, usePlayers} from "../../../state";
import {PlayerLink} from "../../utility";

/**
 * @param {Object} props
 */
export default function Selecting({tourneyId}) {
    const [{players}, dispatch] = useTournament(tourneyId);
    const {playerState} = usePlayers();
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
            {/* <button onClick={() => setIsSelecting(false)}>
                Done
            </button> */}
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
                    {playerState.players.map(({id}) => (
                        <tr key={id}>
                            <td><PlayerLink id={id} firstName /></td>
                            <td><PlayerLink id={id} lastName /></td>
                            <td>
                                <input
                                    type="checkbox"
                                    value={id}
                                    checked={players.includes(id)}
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
