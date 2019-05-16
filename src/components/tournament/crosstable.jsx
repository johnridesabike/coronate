// TODO clean this up, make it less complex and fragile
import React from "react";
import numeral from "numeral";
import {DUMMY_ID} from "../../data/constants";
import {useTournament, usePlayers} from "../../state";
import {
    calcStandings,
    getResultsByOpponent
} from "../../pairing-scoring/scoring";
import style from "./scores.module.css";
/**
 * @param {Object} props
 */
export default function Crosstable({tourneyId}) {
    const [{tieBreaks, roundList}] = useTournament(Number(tourneyId));
    const {getPlayer} = usePlayers();
    const [standingTree] = calcStandings(tieBreaks, roundList);
    return (
        <table className={style.table}>
            <caption>Crosstable</caption>
            <tbody>
                <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    {standingTree.map((standingsFlat, rank) =>
                        standingsFlat.filter(
                            (p) => p.id !== DUMMY_ID
                        ).map((ignore, index, src) =>
                            <th key={rank + "." + index}>
                                {rank + 1}{src.length > 1 && "." + (index + 1)}
                            </th>
                        )
                    )}
                    <th>Score</th>
                    <th>Rating</th>
                </tr>
                {standingTree.map((standingsFlat, rank) =>
                    standingsFlat.filter(
                        (p) => p.id !== DUMMY_ID
                    ).map((standing, index, src) => (
                        <tr key={standing.id} className={style.row}>
                            {index === 0 && ( // Only display the rank once
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
                            {standingTree.map((standingsFlat2, rank2) =>
                                standingsFlat2.filter(
                                    (p) => p.id !== DUMMY_ID
                                ).map((opponent, index2) =>
                                    <td
                                        key={rank2 + "." + index2}
                                        className="table__number"
                                    >
                                        {opponent.id !== standing.id
                                        ? numeral(getResultsByOpponent(standing.id, roundList)[opponent.id]).format("1/2")
                                        : "X"
                                        }
                                    </td>
                                )
                            )}
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
