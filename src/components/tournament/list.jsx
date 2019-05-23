import React, {useState} from "react";
import Icons from "../icons";
import {Link} from "@reach/router";
import {useTournaments} from "../../state";

export default function TournamentList(props) {
    const [tourneys, dispatch] = useTournaments();
    const [newTourneyName, setNewTourneyName] = useState("");

    function updateNewName(event) {
        setNewTourneyName(event.target.value);
    }

    function makeTournament(event) {
        event.preventDefault();
        dispatch({
            name: newTourneyName,
            type: "ADD_TOURNEY"
        });
        setNewTourneyName("");
    }

    return (
        <div>
            {(tourneys.length > 0) &&
                <h2>Tournament list</h2>
            }
            {(tourneys.length > 0)
                ?
                <ol>
                    {tourneys.map((tourney, i) =>
                        <li key={i}>
                            <Link to={String(i)}>
                                {tourney.name}
                            </Link>{" "}
                            <button
                                title={`Delete “${tourney.name}”`}
                                aria-label={`Delete “${tourney.name}”`}
                                className="danger iconButton"
                                onClick={
                                    () => dispatch({
                                        index: i,
                                        type: "DEL_TOURNEY"
                                    })
                                }
                            >
                                <Icons.Trash />
                            </button>
                        </li>
                    )}
                </ol>
                : <p>No tournaments added yet.</p>
            }
            <form onSubmit={makeTournament}>
                <fieldset>
                    <legend>Make a new tournament</legend>
                    <label>Name:{" "}
                        <input
                            type="text"
                            placeholder="tournament name"
                            value={newTourneyName}
                            onChange={updateNewName}
                            required={true}
                        />
                    </label>
                    <input type="submit" value="Create" />
                </fieldset>
            </form>
        </div>
    );
}
