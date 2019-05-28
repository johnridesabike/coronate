import {useAllPlayersDb, useTournament} from "../../../hooks";
import NewPlayer from "../../new-player";
import React from "react";

export default function Selecting(props) {
    const {tourney, tourneyDispatch} = useTournament();
    const [players, allPlayersDispatch] = useAllPlayersDb();

    function togglePlayer(event) {
        const id = event.target.value;
        if (event.target.checked) {
            tourneyDispatch({
                playerIds: tourney.playerIds.concat([id]),
                type: "SET_TOURNEY_PLAYERS"
            });
        } else {
            tourneyDispatch({
                playerIds: tourney.playerIds.filter((pId) => pId !== id),
                type: "SET_TOURNEY_PLAYERS"
            });
        }
    }

    return (
        <div>
            <button
                className="micro"
                onClick={() => tourneyDispatch({
                    playerIds: Object.keys(players),
                    type: "SET_TOURNEY_PLAYERS"
                })}
            >
                Select all
            </button>
            <button
                className="micro"
                onClick={() => tourneyDispatch({
                    playerIds: [],
                    type: "SET_TOURNEY_PLAYERS"
                })}
            >
                Select none
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
                    {Object.values(players).map(({id, firstName, lastName}) =>
                        <tr key={id}>
                            <td>{firstName}</td>
                            <td>{lastName}</td>
                            <td>
                                <input
                                    checked={tourney.playerIds.includes(id)}
                                    type="checkbox"
                                    value={id}
                                    onChange={togglePlayer}
                                />
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <NewPlayer dispatch={allPlayersDispatch}/>
        </div>
    );
}
Selecting.propTypes = {};
