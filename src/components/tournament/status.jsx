// This will probably get merged with scores.jsx at some point
import React from "react";
import numeral from "numeral";
import {DUMMY_ID} from "../../data/constants";
import {useTournament, usePlayers} from "../../state";
import {calcStandings} from "../../pairing-scoring/scoring";
import style from "./scores.module.css";
/**
 * @param {Object} props
 */
export default function Status({tourneyId}) {
    const [{tieBreaks, roundList}] = useTournament(Number(tourneyId));
    const {getPlayer} = usePlayers();
    const [standingTree] = calcStandings(tieBreaks, roundList);
    return (
        <table className={style.table}>
            <caption>Tournament Status</caption>
            <tbody>
                <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Score</th>
                    <th>Rating</th>
                </tr>
                {standingTree.map((standingsFlat, rank) =>
                    standingsFlat.filter(
                        (p) => p.id !== DUMMY_ID
                    ).map((standing, j, src) => (
                        <tr key={standing.id} className={style.row}>
                            {j === 0 && ( // Only display the rank once
                                <th
                                    scope="row"
                                    className={"table__number " + style.rank}
                                    rowSpan={src.length}
                                >
                                    {numeral(rank + 1).format("0o")}
                                </th>
                            )}
                            <th
                                scope="row"
                                className={style.playerName}
                                data-testid={rank}
                            >
                                {getPlayer(standing.id).firstName}&nbsp;
                                {getPlayer(standing.id).lastName}
                            </th>
                            <td
                                className="table__number"
                            >
                                {numeral(standing.score).format("1/2")}
                            </td>
                            <td className="table__number">
                                {getPlayer(standing.id).rating}
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
}
