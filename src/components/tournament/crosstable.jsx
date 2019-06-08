import {
    createStandingList,
    matches2ScoreData
} from "../../pairing-scoring";
import Icons from "../icons";
import PropTypes from "prop-types";
import React from "react";
import {last} from "ramda";
import numeral from "numeral";
import {rounds2Matches} from "../../data-types";
import style from "./scores.module.css";
import {useTournament} from "../../hooks";

export default function Crosstable(props) {
    const {tourney, getPlayer} = useTournament();
    const {tieBreaks, roundList} = tourney;
    const scoreData = matches2ScoreData(rounds2Matches(roundList));
    const standings = createStandingList(tieBreaks, scoreData);

    function getXScore(player1Id, player2Id) {
        if (player1Id === player2Id) {
            return <Icons.X className="disabled" />;
        }
        const result = scoreData[player1Id].opponentResults[player2Id];
        if (result === undefined) {
            return null;
        }
        return numeral(result).format("1/2");
    }

    function getRatingChangeTds(playerId) {
        const firstRating = scoreData[playerId].ratings[0];
        const lastRating = last(scoreData[playerId].ratings);
        const change = numeral(lastRating - firstRating).format("+0");
        return (
            <>
            <td className="table__number">
                {lastRating}
            </td>
            <td className="table__number body-10">
                ({change})
            </td>
            </>
        );
    }

    return (
        <table className={style.table}>
            <caption>Crosstable</caption>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    {/* Display a rank as a shorthand for each player. */}
                    {Object.keys(standings).map((rank) =>
                        <th key={rank}>
                            {Number(rank) + 1}
                        </th>
                    )}
                    <th>Score</th>
                    <th colSpan={2}>Rating</th>
                </tr>
            </thead>
            <tbody>
                {/* Output a row for each player */}
                {standings.map((standing, index)=>
                    <tr key={index} className={style.row}>
                        <th className={style.rank} scope="col">
                            {index + 1}
                        </th>
                        <th className={style.playerName} scope="row">
                            {getPlayer(standing.id).firstName}&nbsp;
                            {getPlayer(standing.id).lastName}
                        </th>
                        {/* Output a cell for each other player */}
                        {standings.map((opponent, index2) =>
                            <td
                                key={index2}
                                className="table__number"
                            >
                                {getXScore(standing.id, opponent.id)}
                            </td>
                        )}
                        {/* Output their score and rating change */}
                        <td className="table__number">
                            {numeral(standing.score).format("1/2")}
                        </td>
                        {getRatingChangeTds(standing.id)}
                    </tr>
                )}
            </tbody>
        </table>
    );
}
Crosstable.propTypes = {
    tourneyId: PropTypes.string
};
