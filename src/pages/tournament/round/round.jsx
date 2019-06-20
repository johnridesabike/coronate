import React, {useState} from "react";
import Icons from "../../../components/icons";
import NotFound from "../../../components/404";
import PropTypes from "prop-types";
import RoundTable from "./round-table";
import {findById} from "../../../components/utility";
import {sum} from "ramda";

export function findIndexById(id, list) {
    return list.indexOf(findById(id, list));
}

export default function Round({roundId, tournament}) {
    const {
        tourney,
        players,
        tourneyDispatch,
        playersDispatch
    } = tournament;
    const matchList = tourney.roundList[roundId];
    const [selectedMatch, setSelectedMatch] = useState(null);
    if (!matchList) {
        return <NotFound />;
    }
    function unMatch(matchId) {
        const match = findById(matchId, matchList);
        if (sum(match.result) !== 0) {
            // checks if the match has been scored yet & resets the players'
            // records
            match.playerIds.forEach(function (pId, color) {
                // If there was a dummy player or a deleted player then bail
                // on the dispatch.
                if (!players[pId]) {
                    return;
                }
                // Decrement the matchcount for each player
                playersDispatch({
                    id: pId,
                    matchCount: players[pId].matchCount - 1,
                    type: "SET_PLAYER_MATCHCOUNT"
                });
                // Set each player's rating to the original rating of the match
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
                tournament={tournament}
            />
        </div>
    );
}
Round.propTypes = {
    roundId: PropTypes.number.isRequired,
    tournament: PropTypes.object.isRequired
};
