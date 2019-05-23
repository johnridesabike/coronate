// this component should eventually replace player-match-info.jsx
import {useOptionsDb, useTournament} from "../../../hooks";
import PropTypes from "prop-types";
import React from "react";
import {createPlayerStats} from "../../../pairing-scoring";

export default function PlayerInfo({playerId, roundId}) {
    const {tourney, players} = useTournament();
    const [options] = useOptionsDb();
    const {
        profile,
        rating,
        score,
        colorBalance,
        hasHadBye,
        opponentHistory,
        avoidList
    } = createPlayerStats({
        avoidList: options.avoidPairs,
        id: playerId,
        playerDataSource: Object.values(players),
        roundId,
        roundList: tourney.roundList
    });
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
                        {players[opId].firstName}{" "}
                        {players[opId].lastName}
                    </li>
                ))}
            </ol>
            <p>
                Players to avoid:
            </p>
            <ol>
                {avoidList.map((pId) => (
                    <li key={pId}>
                        {players[pId].firstName} {players[pId].lastName}
                    </li>
                ))}
            </ol>
        </dl>
    );
}
PlayerInfo.propTypes = {
    playerId: PropTypes.number,
    roundId: PropTypes.number
};
