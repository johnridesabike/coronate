import React, {useState} from "react";
import Icons from "../icons";
import {Link} from "@reach/router";
// import {useTournaments} from "../../state";
import {useAllTournamentsDb} from "../../hooks";

export default function TournamentList(props) {
    const [tourneys, dispatch] = useAllTournamentsDb();
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
            {(Object.keys(tourneys).length > 0) &&
                <h2>Tournament list</h2>
            }
            {(Object.keys(tourneys).length > 0)
                ?
                <ol>
                    {Object.values(tourneys).map(({name, id}) =>
                        <li key={id}>
                            <Link to={id}>
                                {name}
                            </Link>{" "}
                            <button
                                aria-label={`Delete “${name}”`}
                                className="danger iconButton"
                                title={`Delete “${name}”`}
                                onClick={() => dispatch({
                                    index: id,
                                    type: "DEL_TOURNEY"
                                })}
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
                            placeholder="tournament name"
                            required={true}
                            type="text"
                            value={newTourneyName}
                            onChange={updateNewName}
                        />
                    </label>
                    <input type="submit" value="Create" />
                </fieldset>
            </form>
        </div>
    );
}
