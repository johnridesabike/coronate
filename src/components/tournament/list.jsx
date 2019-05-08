import React, {Fragment, useContext, useState} from "react";
import Trash from "react-feather/dist/icons/trash-2";
import Tooltip from "@reach/tooltip";
import "@reach/tooltip/styles.css";
import VisuallyHidden from "@reach/visually-hidden";
import {BackButton} from "../utility";
import createTournament from "../../data/tournament";
import {DataContext} from "../../state/global-state";
import TournamentTabs from "./tabs";

export default function TournamentList() {
    const {data, dispatch} = useContext(DataContext);
    const tourneyList = data.tourneys;
    /** @type {number} */
    const defaultTourney = null;
    const [openTourney, setOpenTourney] = useState(defaultTourney);
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
    let content = <Fragment></Fragment>;
    if (openTourney !== null) {
        content = (
            <TournamentTabs
                tourneyId={openTourney}
                backButton={<BackButton action={() => setOpenTourney(null)}/>}
            />
        );
    } else {
        content = (
            <div>
                {(tourneyList.length > 0) &&
                    <h2>Tournament list</h2>
                }
                {(tourneyList.length > 0)
                    ?
                    <ol>
                        {tourneyList.map((tourney, i) =>
                            <li key={i}>
                                <button
                                    className="tourney-select"
                                    onClick={() => setOpenTourney(i)}>
                                    {tourney.name}
                                </button>
                                <Tooltip
                                    label={`Delete “${tourney.name}”`}
                                    aria-label={`Delete “${tourney.name}”`}>
                                    <button
                                        className="danger"
                                        onClick={
                                            () => dispatch({
                                                type: "DEL_TOURNEY",
                                                index: i
                                            })
                                        }>
                                        <Trash />
                                        <VisuallyHidden>
                                            {/* Does the tooltip make this
                                                redundant? react-testing-library
                                                can't query the tooltips AFAIK.
                                            */}
                                            Delete “{tourney.name}”
                                        </VisuallyHidden>
                                    </button>
                                </Tooltip>
                            </li>
                        )}
                    </ol>
                    : <p>No tournaments added yet.</p>
                }
                <form onSubmit={makeTournament}>
                    <fieldset>
                        <legend>Make a new tournament</legend>
                        <label>Name{" "}
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
    return (
        <div>
            {content}
        </div>
    );
}
