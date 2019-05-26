import {
    createStandingList,
    getPerformanceRatings,
    getResultsByOpponent,
    rounds2Matches
} from "../../pairing-scoring";
import Icons from "../icons";
import PropTypes from "prop-types";
import React from "react";
import {assoc} from "ramda";
import numeral from "numeral";
import style from "./scores.module.css";
import {useTournament} from "../../hooks";

export default function Crosstable(props) {
    const {tourney, getPlayer} = useTournament();
    const {tieBreaks, roundList} = tourney;
    const matches = rounds2Matches(roundList);
    const oppResults = (id) => getResultsByOpponent(matches, id); // curry
    const [standings] = createStandingList(tieBreaks, roundList);
    const opponentScores = standings.reduce(
        (acc, {id}) => assoc(id, oppResults(id), acc),
        {}
    );

    function getXScore(player1Id, player2Id) {
        if (player1Id === player2Id) {
            return <Icons.X/>;
        }
        const result = opponentScores[player1Id][player2Id];
        if (result === undefined) {
            return null;
        }
        return numeral(result).format("1/2");
    }

    function getRatingChange(playerId) {
        const [
            firstRating,
            lastRating
        ] = getPerformanceRatings(matches, playerId);
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
                    {/* Display a rank as a shorthand for each player. */}
                    {Object.keys(standings).map((rank) =>
                        <th key={rank}>
                            {Number(rank) + 1}
                        </th>
                    )}
                    <th>Score</th>
                    <th>Rating</th>
                </tr>
                {/* Output a row for each player */}
                {standings.map((standing, index)=>
                    <tr key={index} className={style.row}>
                        <th scope="col">
                            {index + 1}
                        </th>
                        <th className={style.playerName} scope="row">
                            {getPlayer(standing.id).firstName}&nbsp;
                            {getPlayer(standing.id).lastName}
                        </th>
                        {/* Output a cell for each other player */}
                        {standings.map((opponent, index2) =>
                            <td key={index2} className="table__number">
                                {getXScore(standing.id, opponent.id)}
                            </td>
                        )}
                        {/* Output their score and rating change */}
                        <td className="table__number">
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
    tourneyId: PropTypes.string
};
