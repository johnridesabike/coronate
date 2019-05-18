// TODO: This component is in need of a major cleanup. I made this way too
// complex and fragile.
import React, {useMemo} from "react";
import numeral from "numeral";
import {assoc} from "ramda";
import X from "react-feather/dist/icons/x";
import {useTournament, usePlayers} from "../../state";
import {
    createStandingList,
    getResultsByOpponent,
    getPerformanceRatings
} from "../../pairing-scoring/scoring";
import style from "./scores.module.css";
/**
 * @typedef {import("../../pairing-scoring").Standing} Standing
 */

/**
 * @param {Object} props
 */
export default function Crosstable({tourneyId}) {
    const [{tieBreaks, roundList}] = useTournament(Number(tourneyId));
    const {getPlayer} = usePlayers();
    const [standings, opponentScores] = useMemo(
        function () {
            const [standingsFlat] = createStandingList(tieBreaks, roundList);
            /** @type {Object.<string, Object.<string, number>>} */
            const opponentResults = standingsFlat.reduce(
                /** @param {Object.<string, Object.<string, number>>} acc */
                (acc, standing) => (
                    assoc(
                        String(standing.id),
                        getResultsByOpponent(standing.id, roundList),
                        acc
                    )
                ),
                {}
            );
            return [standingsFlat, opponentResults];
        },
        [roundList, tieBreaks]
    );
    /**
     * @param {number} player1Id
     * @param {number} player2Id
     */
    function getXScore(player1Id, player2Id) {
        if (player1Id === player2Id) {
            return <X/>;
        }
        const result = opponentScores[String(player1Id)][player2Id];
        if (result === undefined) {
            return null;
        }
        return numeral(result).format("1/2");
    }
    /** @param {number} playerId */
    function getRatingChange(playerId) {
        const [
            firstRating,
            lastRating
        ] = getPerformanceRatings(playerId, roundList);
        const change = numeral(lastRating - firstRating).format("+0");
        return `${lastRating}\xA0(${change})`; // \xA0 = &nsbp;
    }
    return (
        <table className={style.table}>
            <caption>Crosstable</caption>
            <tbody>
                <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    {standings.map((ignore, index) =>
                        <th key={index}>
                            {index + 1}
                        </th>
                    )}
                    <th>Score</th>
                    <th>Rating</th>
                </tr>
                {standings.map((standing, index)=>
                    <tr key={index} className={style.row}>
                        <th scope="col">
                            {index + 1}
                        </th>
                        <th
                            scope="row"
                            className={style.playerName}
                        >
                            {getPlayer(standing.id).firstName}&nbsp;
                            {getPlayer(standing.id).lastName}
                        </th>
                        {standings.map((opponent, index2) =>
                            <td
                                key={index2}
                                className="table__number"
                            >
                                {getXScore(standing.id, opponent.id)}
                            </td>
                        )}
                        <td
                            className="table__number"
                        >
                            {numeral(standing.score).format("1/2")}
                        </td>
                        <td className="table__number">
                            {getRatingChange(standing.id)}
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}
