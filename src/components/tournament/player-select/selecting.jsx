import {useAllPlayersDb, useTournament} from "../../../hooks";
import NewPlayer from "../../players/new-player";
// import PropTypes from "prop-types";
import React from "react";

export default function Selecting(props) {
    const {tourney, tourneyDispatch} = useTournament();
    const dispatch = tourneyDispatch;
    const [players] = useAllPlayersDb();

    function togglePlayer(event) {
        const id = Number(event.target.value);
        if (event.target.checked) {
            dispatch({
                players: tourney.players.concat([id]),
                type: "SET_TOURNEY_PLAYERS"
            });
        } else {
            dispatch({
                players: tourney.players.filter((pId) => pId !== id),
                type: "SET_TOURNEY_PLAYERS"
            });
        }
    }

    return (
        <div>
            <button
                onClick={() =>
                    dispatch({
                        players: players.map(
                            (p) => p.id
                        ),
                        type: "SET_TOURNEY_PLAYERS"
                    })
                }
            >
                Select all
            </button>
            <button
                onClick={() =>
                    dispatch({
                        players: [],
                        type: "SET_TOURNEY_PLAYERS"
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
                    {Object.values(players).map(({id, firstName, lastName}) => (
                        <tr key={id}>
                            <td>{firstName}</td>
                            <td>{lastName}</td>
                            <td>
                                <input
                                    type="checkbox"
                                    value={id}
                                    checked={tourney.players.includes(id)}
                                    onChange={togglePlayer}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <NewPlayer />
        </div>
    );
}
Selecting.propTypes = {};
