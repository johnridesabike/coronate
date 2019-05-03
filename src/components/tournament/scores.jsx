import React, {useContext} from "react";
import curry from "ramda/src/curry";
import numeral from "numeral";
import {dummyPlayer, getPlayerById} from "../../data/player";
import {DataContext} from "state/global-state";
import {calcStandings} from "../../pairing-scoring/scoring";
import style from "./scores.module.css";

// let's make a custom numeral format. I don't really know how this works.
numeral.register("format", "half", {
    regexps: {
        format: /(1\/2)/,
        unformat: /(1\/2)/
    },
    format: function (value, format, roundingFunction) {
        let whole = Math.floor(value);
        let remainder = value - whole;
        if (remainder === 0.5) {
            remainder = "½";
        } else if (remainder === 0) {
            remainder = "";
        }
        if (whole === 0 && remainder) {
            whole = "";
        }
        // let output = numeral._.numberToFormat(value, format, roundingFunction);
        // return output;
        return String(whole) + remainder;
    },
    unformat: function(string) {
        return string; // todo
    }
});

/**
 * @param {Object} props
 * @param {number} props.tourneyId
 */
function Scores({tourneyId}) {
    const {data} = useContext(DataContext);
    const getPlayer = curry(getPlayerById)(data.players);
    const tourney = data.tourneys[tourneyId];
    const [standingTree, tbMethods] = calcStandings(
        tourney.tieBreaks,
        tourney.roundList
    );
    return (
        <table className={style.table}>
            <caption>Standings</caption>
            <thead>
                <tr>
                    <th scope="col">Rank</th>
                    <th scope="col">Name</th>
                    <th scope="col">Score</th>
                    {tbMethods.map((name, i) => (
                        <th key={i} scope="col">
                            {name}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {standingTree.map((standingsFlat, rank) =>
                    standingsFlat.filter(
                        (p) => p.id !== dummyPlayer.id
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
                            <th scope="row" className={style.playerName}>
                                {getPlayer(standing.id).firstName}&nbsp;
                                {getPlayer(standing.id).lastName}
                            </th>
                            <td className="table__number">
                                {numeral(standing.score).format("1/2")}
                            </td>
                            {standing.tieBreaks.map((score, i) => (
                                <td key={i} className="table__number">
                                    {numeral(score).format("1/2")}
                                </td>
                            ))}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
}

export default Scores;
