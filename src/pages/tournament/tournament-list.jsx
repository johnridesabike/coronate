import {DateFormat, SortLabel} from "../../components/utility";
import React, {useEffect, useState} from "react";
import {WindowBody, useWindowContext} from "../../components/window";
import {useAllTournamentsDb, useSortedTable} from "../../hooks";
import {Dialog} from "@reach/dialog";
import Icons from "../../components/icons";
import {Link} from "@reach/router";
import VisuallyHidden from "@reach/visually-hidden";

export default function TournamentList(props) {
    const [tourneys, dispatch] = useAllTournamentsDb();
    const [sorted, sortDispatch] = useSortedTable(
        Object.values(tourneys),
        "date",
        true
    );
    const [newTourneyName, setNewTourneyName] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const {winDispatch} = useWindowContext();
    useEffect(
        function setDocumentTitle() {
            winDispatch({title: "Tournament list"});
            return () => winDispatch({action: "RESET_TITLE"});
        },
        [winDispatch]
    );
    useEffect(
        function () {
            sortDispatch({table: Object.values(tourneys)});
        },
        [tourneys, sortDispatch]
    );

    function updateNewName(event) {
        setNewTourneyName(event.target.value);
    }

    function makeTournament(event) {
        event.preventDefault();
        dispatch({name: newTourneyName, type: "ADD_TOURNEY"});
        setNewTourneyName("");
        setIsFormOpen(false);
    }

    function deleteTournament(id, name) {
        const message = "Are you sure you want to delete “" + name + "”?";
        if (window.confirm(message)) {
            dispatch({id, type: "DEL_ITEM"});
        }
    }

    return (
        <WindowBody>
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
                            <th>
                                <SortLabel
                                    data={sorted}
                                    dispatch={sortDispatch}
                                    sortKey="name"
                                >
                                    Name
                                </SortLabel>
                            </th>
                            <th>
                                <SortLabel
                                    data={sorted}
                                    dispatch={sortDispatch}
                                    sortKey="date"
                                >
                                    Date
                                </SortLabel>
                            </th>
                            <th><VisuallyHidden>Controls</VisuallyHidden></th>
                        </tr>
                    </thead>
                    <tbody className="content">
                        {sorted.table.map(({date, id, name}) =>
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
                                        onClick={
                                            () => deleteTournament(id, name)
                                        }
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
                                id="tourney-name"
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
        </WindowBody>
    );
}
