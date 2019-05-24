import React, {useState} from "react";
import {findById, findIndexById} from "../../utility";
import {useRound, useTournament} from "../../../hooks";
import Icons from "../../icons";
import MatchRow from "./match-row";
import PropTypes from "prop-types";
import style from "./round.module.css";

export default function Round({roundId, tourneyId}) {
    const {tourney, tourneyDispatch} = useTournament();
    const dispatch = tourneyDispatch;
    const {matchList} = useRound(tourney, roundId);
    const playerDispatch = () => null;
    const getPlayer = () => ({matchCount: 1});
    const [selectedMatch, setSelectedMatch] = useState(null);
    if (!matchList) {
        throw new Error("Round " + roundId + " does not exist.");
    }
    function unMatch(matchId) {
        const match = findById(matchId, matchList);
        if (match.result.reduce((a, b) => a + b) !== 0) {
            // checks if the match has been scored yet & resets the players'
            // records
            match.playerIds.forEach(function (pId, color) {
                playerDispatch({
                    id: pId,
                    matchCount: getPlayer(pId).matchCount - 1,
                    type: "SET_PLAYER_MATCHCOUNT"
                });
                playerDispatch({
                    id: pId,
                    rating: match.origRating[color],
                    type: "SET_PLAYER_RATING"
                });
            });
        }
        dispatch({matchId, roundId, tourneyId, type: "DEL_MATCH"});
        setSelectedMatch(null);
    }

    function swapColors(matchId) {
        dispatch({matchId, roundId, tourneyId,  type: "SWAP_COLORS"});
    }

    function moveMatch(matchId, direction) {
        const oldIndex = findIndexById(matchId, matchList);
        const newIndex = (
            (oldIndex + direction >= 0)
            ? oldIndex + direction
            : 0
        );
        dispatch({newIndex, oldIndex, roundId, tourneyId, type: "MOVE_MATCH"});
    }

    return (
        <div>
            <div className={style.toolbar}>
                <button
                    className="danger iconButton"
                    disabled={selectedMatch === null}
                    onClick={() => unMatch(selectedMatch)}
                >
                    <Icons.Trash /> Unmatch
                </button>
                <button
                    className="iconButton"
                    disabled={selectedMatch === null}
                    onClick={() => swapColors(selectedMatch)}
                >
                    <Icons.Repeat /> Swap colors
                </button>
                <button
                    className="iconButton"
                    disabled={selectedMatch === null}
                    onClick={() => moveMatch(selectedMatch, -1)}
                >
                    <Icons.ArrowUp /> Move up
                </button>
                <button
                    className="iconButton"
                    disabled={selectedMatch === null}
                    onClick={() => moveMatch(selectedMatch, 1)}
                >
                    <Icons.ArrowDown /> Move down
                </button>
            </div>
            {(matchList.length === 0) &&
                <p>No players matched yet.</p>
            }
            <table className={style.table}>
                {(matchList.length > 0) &&
                    <caption>Round {roundId + 1} results</caption>
                }
                <tbody>
                    {(matchList.length > 0) &&
                        <tr>
                            <th className="row__id" scope="col">
                                #
                            </th>
                            <th className="row__player" scope="col">
                                White
                            </th>
                            <th className="row__player" scope="col">
                                Black
                            </th>
                            <th className="row__result" scope="col">
                                Result
                            </th>
                            <th className="row__controls" scope="col">
                                Controls
                            </th>
                        </tr>
                    }
                    {matchList.map((match, pos) => (
                        <MatchRow
                            key={match.id}
                            match={match}
                            pos={pos}
                            roundId={roundId}
                            selectedMatch={selectedMatch}
                            setSelectedMatch={setSelectedMatch}
                            tourneyId={tourneyId}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
Round.propTypes = {
    roundId: PropTypes.number,
    tourneyId: PropTypes.number
};
