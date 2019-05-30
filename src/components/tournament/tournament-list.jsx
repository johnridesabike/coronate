import React, {useState} from "react";
import {useAllTournamentsDb, useDocumentTitle} from "../../hooks";
import {DateFormat} from "../utility";
import {Dialog} from "@reach/dialog";
import Icons from "../icons";
import {Link} from "@reach/router";
import VisuallyHidden from "@reach/visually-hidden";

export default function TournamentList(props) {
    const [tourneys, dispatch] = useAllTournamentsDb();
    const [newTourneyName, setNewTourneyName] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    useDocumentTitle("tournament list");

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

    function deleteTournament(id, name) {
        const message = "Are you sure you want to delete “" + name + "”?";
        if (window.confirm(message)) {
            dispatch({id, type: "DEL_ITEM"});
        }
    }

    return (
        <div className="content-area">
            <div className="toolbar toolbar__left">
                <button
                    onClick={() => setIsFormOpen(true)}
                >
                    <Icons.Plus /> Add tournament
                </button>
            </div>
            {(Object.keys(tourneys).length > 0)
            ?
            <table>
                <caption>Tournament list</caption>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Date</th>
                        <th><VisuallyHidden>Controls</VisuallyHidden></th>
                    </tr>
                </thead>
                <tbody className="content">
                    {Object.values(tourneys).map(({date, id, name}) =>
                        <tr key={id} className="buttons-on-hover">
                            <td>
                                <Link to={id}>
                                    {name}
                                </Link>
                            </td>
                            <td>
                                <DateFormat date={date} />
                            </td>
                            <td>
                                <button
                                    aria-label={`Delete “${name}”`}
                                    className="danger button-ghost"
                                    title={`Delete “${name}”`}
                                    onClick={() => deleteTournament(id, name)}
                                >
                                    <Icons.Trash />
                                </button>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            : <p>No tournaments added yet.</p>
            }
            <Dialog isOpen={isFormOpen}>
                <button
                    className="button-micro"
                    onClick={() => setIsFormOpen(false)}
                >
                    Close
                </button>
                <form onSubmit={makeTournament}>
                    <fieldset>
                        <legend>Make a new tournament</legend>
                        <label htmlFor="tourney-name">Name:</label>
                        <input
                            name="tourney-name"
                            placeholder="tournament name"
                            required={true}
                            type="text"
                            value={newTourneyName}
                            onChange={updateNewName}
                        />{" "}
                        <input
                            className="button-primary"
                            type="submit"
                            value="Create"
                        />
                    </fieldset>
                </form>
            </Dialog>
        </div>
    );
}
