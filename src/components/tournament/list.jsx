// @ts-check
import React, {Fragment, useContext, useState} from "react";
import {BackButton} from "../utility";
import createTournament from "../../chess-tourney/tournament";
import {DataContext} from "../../state/global-state";
import TournamentTabs from "./tabs";

export default function TournamentList() {
    const {data, dispatch} = useContext(DataContext);
    const tourneyList = data.tourneys;
    const [openTourney, setOpenTourney] = useState(null);
    const [newTourneyName, setNewTourneyName] = useState("");
    function updateNewName(event) {
        setNewTourneyName(event.target.value);
    }
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
            {(
                (tourneyList.length > 0)
                ?
                    <ol>
                    {tourneyList.map((tourney, i) =>
                        <li key={i}>
                            <button
                                className="tourney-select"
                                onClick={() => setOpenTourney(i)}>
                                {tourney.name}
                            </button>
                            <button
                                className="danger"
                                onClick={
                                    () => dispatch({
                                        type: "DEL_TOURNEY",
                                        index: i
                                    })
                                }>
                                delete
                            </button>
                        </li>
                    )}
                    </ol>
                :
                    <p>
                        No tournaments added yet.
                    </p>
            )}
                <form onSubmit={makeTournament}>
                    <fieldset>
                        <legend>Make a new tournament</legend>
                        <input
                            type="text"
                            placeholder="tournament name"
                            value={newTourneyName}
                            onChange={updateNewName}
                            required={true}/>
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
