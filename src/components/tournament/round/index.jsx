import React, {useState, useEffect} from "react";
import Round from "./round";
import PairPicker from "../pair-picker";
import {useRound} from "../../../state";

/**
 * @param {Object} props
 * @param {number} props.roundId
 * @param {number} props.tourneyId
 */
export default function Index({tourneyId, roundId}) {
    // eslint-disable-next-line fp/no-mutation
    tourneyId = Number(tourneyId); // reach router passes a string instead
    const {unmatched} = useRound(tourneyId, roundId);
    const [isPickView, setIsPickView] = useState(unmatched.length > 0);
    useEffect(
        function () {
            setIsPickView(unmatched.length > 0);
        },
        [unmatched.length]
    );
    if (isPickView) {
        return (
            <PairPicker
                tourneyId={tourneyId}
                roundId={roundId}
                setIsPickView={setIsPickView}
            />
        );
    } else {
        return (
            <Round
                tourneyId={tourneyId}
                roundId={roundId}
                setIsPickView={setIsPickView}
            />
        );
    }
}
