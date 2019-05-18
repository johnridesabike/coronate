// this component should eventually replace player-match-info.jsx
import React from "react";
import {createPlayerStats} from "../../../pairing-scoring/scoring";
import {useTournament, usePlayers} from "../../../state";

/**
 * @typedef {import("../../../factory-types").Match} Match
 */

/**
 * @param {Object} props
 * @param {number} props.playerId
 * @param {number} props.tourneyId
 * @param {number} props.roundId
 */
export default function PlayerInfo({playerId, tourneyId, roundId}) {
    const [{roundList}] = useTournament(tourneyId);
    const {playerState, getPlayer} = usePlayers();
    const {players, avoid} = playerState;
    const {
        profile,
        rating,
        score,
        colorBalance,
        hasHadBye,
        opponentHistory,
        avoidList
    } = createPlayerStats(playerId, players, avoid, roundList, roundId);
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
                {profile.firstName} {profile.lastName}
            </h3>
            <p>Score: {score}</p>
            <p>Rating: {rating}</p>
            <p>Color balance: {prettyBalance}</p>
            <p>Has had a bye round: {hasHadBye ? "Yes" : "No"}</p>
            <p>Opponent history:</p>
            <ol>
                {opponentHistory.map((opId) => (
                    <li key={opId}>
                        {getPlayer(opId).firstName}{" "}
                        {getPlayer(opId).lastName}
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
