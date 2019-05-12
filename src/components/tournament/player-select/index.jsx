import React, {useState} from "react";
import {useTournament} from "../../../state/tourneys-state";
import Selecting from "./selecting";
import Roster from "./roster";

/**
 * @param {Object} props
 */
export default function PlayerSelect({tourneyId}) {
    tourneyId = Number(tourneyId); // reach router passes a string instead.
    const [tourney] = useTournament(tourneyId);
    const [isSelecting, setIsSelecting] = useState(
        tourney.players.length === 0
    );
    if (isSelecting) {
        return (
            <Selecting tourneyId={tourneyId} setIsSelecting={setIsSelecting} />
        );
    } else {
        return (
            <Roster tourneyId={tourneyId} setIsSelecting={setIsSelecting} />
        );
    }
}
