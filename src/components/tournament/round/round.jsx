import React, {useState} from "react";
import PropTypes from "prop-types";
import Icons from "../../icons";
import MatchRow from "./match-row";
import {findById, findIndexById} from "../../utility";
import {useRound, usePlayers} from "../../../state";
import style from "./round.module.css";

export default function Round({roundId, tourneyId}) {
    const {matchList, dispatch} = useRound(tourneyId, roundId);
    const {playerDispatch, getPlayer} = usePlayers();
    const [selectedMatch, setSelectedMatch] = useState(null);
    if (!matchList) {
        throw new Error("Round " + roundId + " does not exist.");
    }
    function unMatch(matchId) {
        const match = findById(matchId, matchList);
        if (match.result.reduce((a, b) => a + b) !== 0) {
            // checks if the match has been scored yet & resets the players'
            // records
            match.players.forEach(function (pId, color) {
                playerDispatch({
                    type: "SET_PLAYER_MATCHCOUNT",
                    id: pId,
                    matchCount: getPlayer(pId).matchCount - 1
                });
                playerDispatch({
                    type: "SET_PLAYER_RATING",
                    id: pId,
                    rating: match.origRating[color]
                });
            });
        }
        dispatch({type: "DEL_MATCH", tourneyId, roundId, matchId});
        setSelectedMatch(null);
    }

    function swapColors(matchId) {
        dispatch({type: "SWAP_COLORS", tourneyId, roundId, matchId});
    }

    function moveMatch(matchId, direction) {
        const oldIndex = findIndexById(matchId, matchList);
        const newIndex = (
            (oldIndex + direction >= 0)
            ? oldIndex + direction
            : 0
        );
        dispatch({type: "MOVE_MATCH", tourneyId, roundId, oldIndex, newIndex});
    }

    return (
        <div>
            <div className={style.toolbar}>
                <button
                    className="danger iconButton"
                    onClick={() => unMatch(selectedMatch)}
                    disabled={selectedMatch === null}
                >
                    <Icons.Trash /> Unmatch
                </button>
                <button
                    className="iconButton"
                    onClick={() => swapColors(selectedMatch)}
                    disabled={selectedMatch === null}
                >
                    <Icons.Repeat /> Swap colors
                </button>
                <button
                    className="iconButton"
                    onClick={() => moveMatch(selectedMatch, -1)}
                    disabled={selectedMatch === null}
                >
                    <Icons.ArrowUp /> Move up
                </button>
                <button
                    className="iconButton"
                    onClick={() => moveMatch(selectedMatch, 1)}
                    disabled={selectedMatch === null}
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
                            pos={pos}
                            match={match}
                            tourneyId={tourneyId}
                            roundId={roundId}
                            selectedMatch={selectedMatch}
                            setSelectedMatch={setSelectedMatch}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
Round.propTypes = {
    tourneyId: PropTypes.number,
    roundId: PropTypes.number
};
