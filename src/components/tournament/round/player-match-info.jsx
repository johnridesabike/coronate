import {useOptionsDb, useTournament} from "../../../hooks";
import PropTypes from "prop-types";
import React from "react";
import {createPlayerStats} from "../../../pairing-scoring";
import {findById} from "../../utility";
import numeral from "numeral";

export default function PlayerMatchInfo({matchId, color, roundId}) {
    const {tourney, players, getPlayer} = useTournament();
    const matchList = tourney.roundList[roundId];
    const [options] = useOptionsDb();
    const match = findById(matchId, matchList);
    const playerData = createPlayerStats({
        avoidList: options.avoidPairs,
        id: match.playerIds[color],
        players,
        roundId,
        roundList: tourney.roundList
    });
    const colorBalance = playerData.colorBalance;
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
                {playerData.profile.firstName} {playerData.profile.lastName}
            </h3>
            <dt>Score</dt>
            <dd>{playerData.score}</dd>
            <dt>Rating</dt>
            <dd data-testid={`rating-${playerData.id}`}>
                {match.origRating[color]} (
                {numeral(
                    match.newRating[color] - match.origRating[color]
                ).format("+0")}
                )
            </dd>
            <dt>Color balance</dt>
            <dd>{prettyBalance}</dd>
            <dt>Has had a bye round</dt>
            <dd>{playerData.hasHadBye ? "Yes" : "No"}</dd>
            <dt>Opponent history</dt>
            <dd>
                <ol>
                    {playerData.opponentHistory.map((opId) => (
                        <li key={opId}>
                            {getPlayer(opId).firstName}{" "}
                            {getPlayer(opId).lastName}
                        </li>
                    ))}
                </ol>
            </dd>
        </dl>
    );
}
PlayerMatchInfo.propTypes = {
    color: PropTypes.number,
    matchId: PropTypes.string,
    roundId: PropTypes.number
};
