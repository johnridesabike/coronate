import {
    avoidPairReducer,
    matches2ScoreData,
    rounds2Matches
} from "../../../pairing-scoring";
// this component should eventually replace player-match-info.jsx
import {useOptionsDb, useTournament} from "../../../hooks";
import {DUMMY_ID} from "../../../data-types";
import PropTypes from "prop-types";
import React from "react";
import {sum} from "ramda";

export default function PlayerInfo({playerId, roundId}) {
    const {tourney, players, getPlayer} = useTournament();
    const [options] = useOptionsDb();
    const avoidDict = options.avoidPairs.reduce(avoidPairReducer, {});
    // TODO: This should probably be computed by a parent component and passed
    // down via props.
    const matches = rounds2Matches(tourney.roundList, roundId);
    const scoreData = matches2ScoreData(matches);
    const {
        colorScores,
        opponentResults,
        results
    } = scoreData[playerId];
    const colorBalance = sum(colorScores);
    const player = players[playerId];
    const hasBye = Object.keys(opponentResults).includes(DUMMY_ID);
    const avoidList = avoidDict[playerId] || [];
    // const {
    //     profile,
    //     rating,
    //     score,
    //     colorBalance,
    //     hasHadBye,
    //     opponentHistory,
    //     avoidList
    // } = createPlayerStats({
    //     avoidList: options.avoidPairs,
    //     id: playerId,
    //     players,
    //     roundId,
    //     roundList: tourney.roundList
    // });
    const prettyBalance = (function () {
        if (colorBalance < 0) {
            return "White +" + Math.abs(colorBalance);
        } else if (colorBalance > 0) {
            return "Black +" + colorBalance;
        } else {
            return "Even";
        }
    }());
    return (
        <dl className="player-card">
            <h3>
                {player.firstName} {player.lastName}
            </h3>
            <p>Score: {sum(results)}</p>
            <p>Rating: {player.rating}</p>
            <p>Color balance: {prettyBalance}</p>
            <p>Has had a bye round: {hasBye ? "Yes" : "No"}</p>
            <p>Opponent history:</p>
            <ol>
                {Object.entries(opponentResults).map(([opId, result]) => (
                    <li key={opId}>
                        {getPlayer(opId).firstName}{" "}
                        {getPlayer(opId).lastName}{" "}
                        -{" "}
                        {result === 0 && "Lost"}
                        {result === 1 && "Won"}
                        {result === 0.5 && "Draw"}
                    </li>
                ))}
            </ol>
            <p>
                Players to avoid:
            </p>
            <ol>
                {avoidList.map((pId) => (
                    <li key={pId}>
                        {getPlayer(pId).firstName} {getPlayer(pId).lastName}
                    </li>
                ))}
            </ol>
        </dl>
    );
}
PlayerInfo.propTypes = {
    playerId: PropTypes.string,
    roundId: PropTypes.number
};
