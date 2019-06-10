import React, {useState} from "react";
import {findById, findIndexById} from "../../../components/utility";
import Icons from "../../../components/icons";
import NotFound from "../../../components/404";
import PropTypes from "prop-types";
import RoundTable from "./round-table";
import {useTournament} from "../../../hooks";

export default function Round({roundId}) {
    const {
        tourney,
        players,
        tourneyDispatch,
        playersDispatch
    } = useTournament();
    const matchList = tourney.roundList[roundId];
    const [selectedMatch, setSelectedMatch] = useState(null);
    if (!matchList) {
        return <NotFound />;
    }
    function unMatch(matchId) {
        const match = findById(matchId, matchList);
        if (match.result.reduce((a, b) => a + b) !== 0) {
            // checks if the match has been scored yet & resets the players'
            // records
            match.playerIds.forEach(function (pId, color) {
                playersDispatch({
                    id: pId,
                    matchCount: players[pId].matchCount - 1,
                    type: "SET_PLAYER_MATCHCOUNT"
                });
                playersDispatch({
                    id: pId,
                    rating: match.origRating[color],
                    type: "SET_PLAYER_RATING"
                });
            });
        }
        tourneyDispatch({matchId, roundId, type: "DEL_MATCH"});
        setSelectedMatch(null);
    }

    function swapColors(matchId) {
        tourneyDispatch({matchId, roundId, type: "SWAP_COLORS"});
    }

    function moveMatch(matchId, direction) {
        const oldIndex = findIndexById(matchId, matchList);
        const newIndex = (oldIndex + direction >= 0) ? oldIndex + direction : 0;
        tourneyDispatch({newIndex, oldIndex, roundId, type: "MOVE_MATCH"});
    }

    return (
        <div className="content-area">
            <div className="toolbar">
                <button
                    className="button-micro"
                    disabled={selectedMatch === null}
                    onClick={() => unMatch(selectedMatch)}
                >
                    <Icons.Trash /> Unmatch
                </button>{" "}
                <button
                    className="button-micro"
                    disabled={selectedMatch === null}
                    onClick={() => swapColors(selectedMatch)}
                >
                    <Icons.Repeat /> Swap colors
                </button>{" "}
                <button
                    className="button-micro"
                    disabled={selectedMatch === null}
                    onClick={() => moveMatch(selectedMatch, -1)}
                >
                    <Icons.ArrowUp /> Move up
                </button>{" "}
                <button
                    className="button-micro"
                    disabled={selectedMatch === null}
                    onClick={() => moveMatch(selectedMatch, 1)}
                >
                    <Icons.ArrowDown /> Move down
                </button>
            </div>
            {matchList.length === 0 &&
                <p>No players matched yet.</p>
            }
            <RoundTable
                roundId={roundId}
                selectedMatch={selectedMatch}
                setSelectedMatch={setSelectedMatch}
            />
        </div>
    );
}
Round.propTypes = {
    roundId: PropTypes.number,
    tourneyId: PropTypes.number
};
