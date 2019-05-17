import React from "react";
import numeral from "numeral";
import {createPlayerData} from "../../../pairing-scoring/scoring";
import {useRound, usePlayers} from "../../../state";
import {getById} from "../../../data/utility";

/**
 * @typedef {import("../../../data").Match} Match
 */

/**
 * @param {Object} props
 * @param {string} props.matchId
 * @param {number} props.color
 * @param {number} props.tourneyId
 * @param {number} props.roundId
 */
export default function PlayerMatchInfo({matchId, color, tourneyId, roundId}) {
    const {tourney, matchList} = useRound(tourneyId, roundId);
    const {playerState, getPlayer} = usePlayers();
    const match = getById(matchList, matchId);
    const playerData = createPlayerData(
        match.players[color],
        playerState.players,
        playerState.avoid,
        tourney.roundList,
        roundId
    );
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
