import React, {useMemo} from "react";
import MatchRow from "./match-row";
import PropTypes from "prop-types";
import VisuallyHidden from "@reach/visually-hidden";
import {matches2ScoreData} from "../../../pairing-scoring";
import {rounds2Matches} from "../../../data-types";
import style from "./round.module.css";

export default function RoundTable({
    compact,
    roundId,
    selectedMatch,
    setSelectedMatch,
    tournament
}) {
    const {tourney} = tournament;
    const matchList = tourney.roundList[roundId];
    // matches2ScoreData is relatively expensive
    const scoreData = useMemo(
        () => matches2ScoreData(rounds2Matches(tourney.roundList)),
        [tourney.roundList]
    );
    return (
        <table className={style.table}>
            {matchList.length > 0 &&
                <>
                <caption
                    className={compact ? "title-30" : "title-40"}
                >
                    Round {roundId + 1} matches
                </caption>
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
                        scoreData={scoreData}
                        tournament={tournament}
                    />
                ))}
            </tbody>
        </table>
    );
}
RoundTable.propTypes = {
    compact: PropTypes.bool,
    roundId: PropTypes.number.isRequired,
    selectedMatch: PropTypes.string,
    setSelectedMatch: PropTypes.func,
    tournament: PropTypes.object.isRequired
};
