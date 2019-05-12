import React, {useState} from "react";
import Selecting from "./selecting";
import Roster from "./roster";
import {useTournament} from "../../../state";

/**
 * @param {Object} props
 */
export default function PlayerSelect({tourneyId}) {
    tourneyId = Number(tourneyId); // reach router passes a string instead.
    const [{players}] = useTournament(tourneyId);
    const [isSelecting, setIsSelecting] = useState(players.length === 0);
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
