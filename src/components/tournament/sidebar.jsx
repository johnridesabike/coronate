import {calcNumOfRounds, getUnmatched} from "../../pairing-scoring";
import {useDocumentTitle, useTournament} from "../../hooks";
import {DUMMY_ID} from "../../data-types";
import Icons from "../icons";
import {Link} from "@reach/router";
import {Notification} from "../utility";
import PropTypes from "prop-types";
import React from "react";
import last from "ramda/src/last";

export default function Sidebar(props) {
    const {
        tourney,
        players,
        getPlayer,
        playersDispatch,
        tourneyDispatch
    } = useTournament();
    useDocumentTitle(tourney.name);
    const {roundList} = tourney;
    const unmatched = getUnmatched(tourney, players, roundList.length - 1);

    const isNewRoundReady = (function () {
        const lastRound = last(roundList);
        if (!lastRound) {
            return true;
        }
        const results = lastRound.map(
            (match) => match.result[0] + match.result[1]
        );
        return Object.keys(unmatched).length === 0 && !results.includes(0);
    }());
    const roundCount = calcNumOfRounds(Object.keys(players).length);
    const isItOver = roundList.length >= roundCount;
    const [tooltipText, tooltipWarn] = (function () {
        if (!isNewRoundReady) {
            return [
                "Complete the last round before beginning a new one.",
                true
            ];
        } else if (isItOver) {
            return ["All rounds have completed.", true];
        } else {
            return ["Ready to begin a new round.", false];
        }
    }());

    function newRound() {
        const confirmText = "All rounds have completed. Are you sure you want "
            + "to begin a new one?";
        if (isItOver) {
            if (!window.confirm(confirmText)) {
                return;
            }
        }
        tourneyDispatch({type: "ADD_ROUND"});
    }

    async function delLastRound() {
        if (window.confirm("Are you sure you want to delete the last round?")) {
            await props.navigate(".");
            // If a match has been scored, then reset it.
            // Should this logic be somewhere else?
            last(roundList).forEach(function (match) {
                if (match.result[0] + match.result[1] === 0) {
                    return; // Don't change players who haven't scored.
                }
                match.playerIds.forEach(function (pId, color) {
                    if (pId === DUMMY_ID) {
                        return; // Don't try to set the dummy.
                    }
                    const {matchCount} = getPlayer(pId);
                    playersDispatch({
                        id: pId,
                        matchCount: matchCount - 1,
                        type: "SET_PLAYER_MATCHCOUNT"
                    });
                    playersDispatch({
                        id: pId,
                        rating: match.origRating[color],
                        type: "SET_PLAYER_RATING"
                    });
                });
            });
            tourneyDispatch({type: "DEL_LAST_ROUND"});
            if (tourney.roundList.length === 1) {
                // Automatically remake round 1.
                tourneyDispatch({type: "ADD_ROUND"});
            }
        }
    }

    return (
        <div className={props.className}>
            <nav>
                <ul>
                    <li>
                        <Link to="..">
                            <Icons.X/>Close
                        </Link>
                    </li>
                </ul>
                <hr />
                <ul>
                    <li>
                        <Link to=".">
                            <Icons.Users /> Players
                        </Link>
                    </li>
                    <li>
                        <Link to="status">
                            <Icons.Activity /> Status
                        </Link>
                    </li>
                    <li>
                        <Link to="crosstable">
                            <Icons.Layers /> Crosstable
                        </Link>
                    </li>
                    <li>
                        <Link to="scores">
                            <Icons.List /> Score detail
                        </Link>
                    </li>
                </ul>
                <hr />
                <ul>
                    {Object.keys(roundList).map((id) => (
                        <li key={id}>
                            <Link to={`round/${id}`}>
                            Round {Number(id) + 1}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <hr />
            <ul>
                <li className="caption-30">
                    Round progress: {roundList.length}/{roundCount}
                </li>
                <li>
                    <button
                        className={(tooltipWarn ? "" : "button-primary")}
                        disabled={!isNewRoundReady}
                        onClick={newRound}
                    >
                        <Icons.Plus/> New round
                    </button>
                    <Notification success={!tooltipWarn}>
                        {tooltipText}
                    </Notification>
                </li>
                <li>
                    <button
                        className="button-micro"
                        disabled={roundList.length === 0}
                        onClick={delLastRound}
                    >
                        <Icons.Trash /> Remove last round
                    </button>
                </li>
            </ul>
            <hr />
            <ul>
                <li>
                    <Link to="options"><Icons.Settings /> Options</Link>
                </li>
            </ul>
        </div>
    );
}
Sidebar.propTypes = {
    className: PropTypes.string,
    navigate: PropTypes.func.isRequired
};
