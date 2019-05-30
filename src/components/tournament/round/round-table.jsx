import MatchRow from "./match-row";
import PropTypes from "prop-types";
import React from "react";
import VisuallyHidden from "@reach/visually-hidden";
import style from "./round.module.css";
import {useTournament} from "../../../hooks";

export default function RoundTable({
    compact,
    roundId,
    selectedMatch,
    setSelectedMatch
}) {
    const {tourney} = useTournament();
    const matchList = tourney.roundList[roundId];
    return (
        <table className={style.table}>
            {matchList.length > 0 &&
                <>
                <caption>Round {roundId + 1} matches</caption>
                <thead>
                    <tr>
                        <th className={style.rowId} scope="col">
                            #
                        </th>
                        <th scope="col">
                            <VisuallyHidden>White result</VisuallyHidden>
                        </th>
                        <th className="row__player" scope="col">
                            White
                        </th>
                        <th scope="col">
                            <VisuallyHidden>Black result</VisuallyHidden>
                        </th>
                        <th className="row__player" scope="col">
                            Black
                        </th>
                        <th className="row__result" scope="col">
                            Match result
                        </th>
                        {!compact &&
                            <th className="row__controls" scope="col">
                                <VisuallyHidden>Controls</VisuallyHidden>
                            </th>
                        }
                    </tr>
                </thead>
                </>
            }
            <tbody className={style.tbody + " content"}>
                {matchList.map((match, pos) => (
                    <MatchRow
                        key={match.id}
                        compact={compact}
                        match={match}
                        pos={pos}
                        roundId={roundId}
                        selectedMatch={selectedMatch}
                        setSelectedMatch={setSelectedMatch}
                    />
                ))}
            </tbody>
        </table>
    );
}
RoundTable.propTypes = {
    compact: PropTypes.bool,
    roundId: PropTypes.number,
    selectedMatch: PropTypes.string,
    setSelectedMatch: PropTypes.func
};
