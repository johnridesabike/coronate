import React, {useContext} from "react";
import "@reach/menu-button/styles.css";
import numeral from "numeral";
import curry from "ramda/src/curry";
import {getPlayerById} from "../../../data/player";
import {genPlayerData} from "../../../pairing-scoring/scoring";
import {DataContext} from "../../../state/global-state";

/**
 * @typedef {import("../../../data").Match} Match
 */

/**
 * @param {Object} props
 * @param {Match} props.match
 * @param {number} props.color
 * @param {number} props.tourneyId
 * @param {number} props.roundId
 */
export default function PlayerMatchInfo({match, color, tourneyId, roundId}) {
    const {data} = useContext(DataContext);
    // const playerList = data.players;
    const getPlayer = curry(getPlayerById)(data.players);
    const playerData = genPlayerData(
        match.players[color],
        data.players,
        data.avoid,
        data.tourneys[tourneyId].roundList,
        roundId
    );
    const colorBalance = playerData.colorBalance;
    let prettyBalance = "Even";
    if (colorBalance < 0) {
        prettyBalance = "White +" + Math.abs(colorBalance);
    } else if (colorBalance > 0) {
        prettyBalance = "Black +" + colorBalance;
    }
    return (
        <dl className="player-card">
            <h3>
                {playerData.data.firstName} {playerData.data.lastName}
            </h3>
            <dt>Score</dt>
            <dd>{playerData.score}</dd>
            <dt>Rating</dt>
            <dd>
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
            <dt>Players to avoid</dt>
            <dd>
                <ol>
                    {playerData.avoidList.map((pId) => (
                        <li key={pId}>
                            {getPlayer(pId).firstName} {getPlayer(pId).lastName}
                        </li>
                    ))}
                </ol>
            </dd>
        </dl>
    );
}
