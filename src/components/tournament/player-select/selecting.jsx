import NewPlayer from "../../players/new-player";
// import PropTypes from "prop-types";
import React from "react";
import {usePlayers} from "../../../state";
import {useTournament} from "../../../hooks";

export default function Selecting(props) {
    // const [{players}, dispatch] = useTournament(tourneyId);
    const {tourney, tourneyDispatch} = useTournament();
    const dispatch = tourneyDispatch;
    const {playerState, getPlayer} = usePlayers();

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
                        players: playerState.players.map(
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
                    {playerState.players.map(({id}) => (
                        <tr key={id}>
                            <td>{getPlayer(id).firstName}</td>
                            <td>{getPlayer(id).lastName}</td>
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
