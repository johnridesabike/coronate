import React, {useState} from "react";
import Trash from "react-feather/dist/icons/trash-2";
import {Link} from "@reach/router";
import createTournament from "../../data/tournament";
import {useTournaments} from "../../state";

/**
 * @param {Object} props
 */
// eslint-disable-next-line no-unused-vars
export default function TournamentList(props) {
    const [tourneys, dispatch] = useTournaments();
    const [newTourneyName, setNewTourneyName] = useState("");
    /** @param {React.ChangeEvent<HTMLInputElement>} event */
    function updateNewName(event) {
        setNewTourneyName(event.target.value);
    }
    /** @param {React.FormEvent<HTMLFormElement>} event */
    function makeTournament(event) {
        event.preventDefault();
        dispatch({
            type: "ADD_TOURNEY",
            tourney: createTournament({name: newTourneyName})
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
                                        type: "DEL_TOURNEY",
                                        index: i
                                    })
                                }>
                                <Trash />
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
