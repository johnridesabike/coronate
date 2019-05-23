// TODO: This component is in need of a major cleanup. I made this way too
// complex and fragile.
import React, {useMemo} from "react";
import {
    createStandingList,
    getPerformanceRatings,
    getResultsByOpponent,
    rounds2Matches
} from "../../pairing-scoring";
import Icons from "../icons";
import PropTypes from "prop-types";
import {assoc} from "ramda";
import numeral from "numeral";
import style from "./scores.module.css";
import {useTournament as useTournament2} from "../../hooks";

export default function Crosstable(props) {
    const {tourney, getPlayer} = useTournament2();
    const {tieBreaks, roundList} = tourney;
    const [standings, opponentScores] = useMemo(
        function () {
            const [standingsFlat] = createStandingList(tieBreaks, roundList);
            const matches = rounds2Matches(roundList);
            const opponentResults = standingsFlat.reduce(
                (acc, standing) => (
                    assoc(
                        String(standing.id),
                        getResultsByOpponent(standing.id, matches),
                        acc
                    )
                ),
                {}
            );
            return [standingsFlat, opponentResults];
        },
        [roundList, tieBreaks]
    );

    function getXScore(player1Id, player2Id) {
        if (player1Id === player2Id) {
            return <Icons.X/>;
        }
        const result = opponentScores[String(player1Id)][player2Id];
        if (result === undefined) {
            return null;
        }
        return numeral(result).format("1/2");
    }

    function getRatingChange(playerId) {
        const matches = rounds2Matches(roundList);
        const [
            firstRating,
            lastRating
        ] = getPerformanceRatings(playerId, matches);
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
Crosstable.propTypes = {
    path: PropTypes.string,
    tourneyId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};
