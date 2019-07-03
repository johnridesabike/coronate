import {avoidPairReducer} from "../../../Converters.bs";
import {createBlankScoreData} from "../../../Scoring.bs";
// this component should eventually replace player-match-info.jsx
import {DUMMY_ID} from "../../../data-types";
import PropTypes from "prop-types";
import React from "react";
import {sum} from "ramda";
import {useOptionsDb} from "../../../hooks";

export default function PlayerInfo({playerId, players, getPlayer, scoreData}) {
    const [options] = useOptionsDb();
    const avoidDict = options.avoidPairs.reduce(avoidPairReducer, {});
    const playerData = scoreData[playerId] || createBlankScoreData(playerId);
    const {
        colorScores,
        opponentResults,
        results
    } = playerData;
    const colorBalance = sum(colorScores);
    const player = getPlayer(playerId);
    const hasBye = Object.keys(opponentResults).includes(DUMMY_ID);
    const avoidList = avoidDict[playerId] || [];
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
            <p data-testid={"rating-" + player.id}>
                Rating: {player.rating}
            </p>
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
                    players[pId] && // don't show players not in this tourney
                        <li key={pId}>
                            {getPlayer(pId).firstName} {getPlayer(pId).lastName}
                        </li>
                ))}
            </ol>
        </dl>
    );
}
PlayerInfo.propTypes = {
    getPlayer: PropTypes.func.isRequired,
    playerId: PropTypes.string.isRequired,
    players: PropTypes.object.isRequired,
    scoreData: PropTypes.object.isRequired
};
