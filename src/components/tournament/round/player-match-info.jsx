import React from "react";
import PropTypes from "prop-types";
import numeral from "numeral";
import {createPlayerStats} from "../../../pairing-scoring";
import {useRound, usePlayers} from "../../../state";
import {findById} from "../../utility";

export default function PlayerMatchInfo({matchId, color, tourneyId, roundId}) {
    const {tourney, matchList} = useRound(tourneyId, roundId);
    const {playerState, getPlayer} = usePlayers();
    const match = findById(matchId, matchList);
    const playerData = createPlayerStats({
        id: match.players[color],
        playerDataSource: playerState.players,
        avoidList: playerState.avoid,
        roundList: tourney.roundList,
        roundId
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
    matchId: PropTypes.string,
    color: PropTypes.number,
    tourneyId: PropTypes.number,
    roundId: PropTypes.number
};
