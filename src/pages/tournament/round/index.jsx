import {DUMMY_ID, getUnmatched} from "../../../data-types";
import React, {useMemo} from "react";
import PropTypes from "prop-types";
import RoundPanels from "./round-panels";
import {assoc} from "ramda";
import {matches2ScoreData} from "../../../pairing-scoring";
import {rounds2Matches} from "../../../data-types";

// This is a passthrough component that generates match data and passes it to
// children via render props. I extracted this logic to its own component so it
// could be easily reused (e.g. in testing). It may have also made the whole
// component tree more complicated, though.
export function GenRoundData(props) {
    const roundId = Number(props.roundId); // Reach Router passes a string.
    const {tourney, activePlayers, getPlayer} = props.tournament;
    const {roundList} = tourney;
    // matches2ScoreData is relatively expensive
    const scoreData = useMemo(
        () => matches2ScoreData(rounds2Matches(roundList)),
        [roundList]
    );
    // Only calculate unmatched players for the latest round. Old rounds don't
    // get to add new players.
    // Should this be memoized?
    // only use unmatched players if this is the last round.
    const unmatched = (
        roundId === roundList.length - 1
        ? getUnmatched(roundList, activePlayers, roundId)
        : {}
    );
    const unmatchedCount = Object.keys(unmatched).length;
    // make a new list so as not to affect auto-pairing
    const unmatchedWithDummy = (
        unmatchedCount % 2 !== 0
        ? assoc(DUMMY_ID, getPlayer(DUMMY_ID), unmatched)
        : unmatched
    );
    const activePlayersCount = Object.keys(activePlayers).length;
    return props.children({
        ...props,
        activePlayersCount,
        roundId,
        scoreData,
        unmatched,
        unmatchedCount,
        unmatchedWithDummy
    });
}
GenRoundData.propTypes = {
    roundId: PropTypes.string,
    tournament: PropTypes.object.isRequired
};

export default function RenderRound(props) {
    return (
        // I think good practice would be to specify the props to ensure the
        // right data is being passed, but this is shorter to type.
        <GenRoundData {...props}>
            {(data) => <RoundPanels {...data} />}
        </GenRoundData>
    );
};
