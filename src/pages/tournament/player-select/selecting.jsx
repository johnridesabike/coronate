import NewPlayer from "../../../components/new-player";
import PropTypes from "prop-types";
import React from "react";
import VisuallyHidden from "@reach/visually-hidden";
import {useAllPlayersDb} from "../../../hooks";

export default function Selecting({tourney, tourneyDispatch}) {
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
            <div className="toolbar">
                <button
                    className="button-micro"
                    onClick={() => tourneyDispatch({
                        playerIds: Object.keys(players),
                        type: "SET_TOURNEY_PLAYERS"
                    })}
                >
                    Select all
                </button>
                <button
                    className="button-micro"
                    onClick={() => tourneyDispatch({
                        playerIds: [],
                        type: "SET_TOURNEY_PLAYERS"
                    })}
                >
                    Select none
                </button>
            </div>
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
                                <VisuallyHidden>
                                    <label htmlFor={"select-" + id}>
                                        Select {firstName} {lastName}
                                    </label>
                                </VisuallyHidden>
                                <input
                                    checked={tourney.playerIds.includes(id)}
                                    type="checkbox"
                                    value={id}
                                    id={"select-" + id}
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
Selecting.propTypes = {
    tourney: PropTypes.object.isRequired,
    tourneyDispatch: PropTypes.func.isRequired
};
