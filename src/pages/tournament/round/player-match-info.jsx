import {
    DUMMY_ID
    // rounds2Matches
} from "../../../data-types";
import PropTypes from "prop-types";
import React from "react";
import numeral from "numeral";
import {sum} from "ramda";

export default function PlayerMatchInfo({color, scoreData, match, getPlayer}) {
    const playerId = match.playerIds[color];
    const player = getPlayer(playerId);
    const {
        colorScores,
        opponentResults,
        results
    } = scoreData[playerId];
    const colorBalance = sum(colorScores);
    const hasBye = Object.keys(opponentResults).includes(DUMMY_ID);
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
            <dt>Score</dt>
            <dd>{sum(results)}</dd>
            <dt>Rating</dt>
            <dd data-testid={`rating-${playerId}`}>
                {match.origRating[color]} (
                {numeral(
                    match.newRating[color] - match.origRating[color]
                ).format("+0")}
                )
            </dd>
            <dt>Color balance</dt>
            <dd>{prettyBalance}</dd>
            <dt>Has had a bye round</dt>
            <dd>{hasBye ? "Yes" : "No"}</dd>
            <dt>Opponent history</dt>
            <dd>
                <ol>
                    {Object.entries(
                        opponentResults
                    ).map(([opId, result], i, src) => (
                        // don't show the most recent (current) opponent
                        i < src.length - 1 && (
                            <li key={opId}>
                                {getPlayer(opId).firstName}{" "}
                                {getPlayer(opId).lastName}{" "}
                                -{" "}
                                {result === 0 && "Lost"}
                                {result === 1 && "Won"}
                                {result === 0.5 && "Draw"}
                            </li>
                        )
                    ))}
                </ol>
            </dd>
        </dl>
    );
}
PlayerMatchInfo.propTypes = {
    color: PropTypes.number.isRequired,
    getPlayer: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
    scoreData: PropTypes.object.isRequired
};
