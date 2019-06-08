import {calcNumOfRounds, isRoundComplete} from "../../data-types";
import {curry, last} from "ramda";
import {useDocumentTitle, useTournament} from "../../hooks";
import {DUMMY_ID} from "../../data-types";
import Icons from "../icons";
import {Link} from "@reach/router";
import {Notification} from "../utility";
import PropTypes from "prop-types";
import React from "react";

export default function Sidebar(props) {
    const {
        tourney,
        getPlayer,
        activePlayers,
        playersDispatch,
        tourneyDispatch
    } = useTournament();
    useDocumentTitle(tourney.name);
    const {roundList} = tourney;
    const isComplete = curry(isRoundComplete)(tourney, activePlayers);

    const isNewRoundReady = (function () {
        if (roundList.length === 0) {
            return true;
        }
        return isComplete(roundList.length - 1);
    }());
    const roundCount = calcNumOfRounds(Object.keys(activePlayers).length);
    const isItOver = roundList.length >= roundCount;
    const [tooltipText, tooltipWarn] = (function () {
        if (!isNewRoundReady) {
            return [
                "Round in progress.",
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
                            <Icons.X/>
                            <span className="sidebar__hide-on-close">
                                &nbsp;Close
                            </span>
                        </Link>
                    </li>
                </ul>
                <hr />
                <ul>
                    <li>
                        <Link to=".">
                            <Icons.Users />
                            <span className="sidebar__hide-on-close">
                                &nbsp;Players
                            </span>
                        </Link>
                    </li>
                    <li>
                        <Link to="status">
                            <Icons.Activity />
                            <span className="sidebar__hide-on-close">
                                &nbsp;Status
                            </span>
                        </Link>
                    </li>
                    <li>
                        <Link to="crosstable">
                            <Icons.Layers />
                            <span className="sidebar__hide-on-close">
                                &nbsp;Crosstable
                            </span>
                        </Link>
                    </li>
                    <li>
                        <Link to="scores">
                            <Icons.List />
                            <span className="sidebar__hide-on-close">
                                &nbsp;Score detail
                            </span>
                        </Link>
                    </li>
                </ul>
                <hr />
                <h5 className="sidebar__hide-on-close">Rounds</h5>
                <ul>
                    {Object.keys(roundList).map((id) => (
                        <li key={id}>
                            <Link to={`round/${id}`}>
                                {Number(id) + 1}
                                {(isComplete(Number(id)))
                                ? (
                                    <span
                                        className={
                                            "sidebar__hide-on-close "
                                            + "caption-20"}
                                    >
                                        &nbsp;Complete&nbsp;<Icons.Check />
                                    </span>
                                ) : (
                                    <span
                                        className={
                                            "sidebar__hide-on-close "
                                            + "caption-20"}
                                    >
                                        &nbsp;Not complete&nbsp;<Icons.Alert />
                                    </span>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <hr />
            <ul>
                <li className="caption-30">
                    <span className=" sidebar__hide-on-close">
                        Completion:{" "}
                    </span>
                    {roundList.length}/{roundCount}
                </li>
                <li>
                    <Notification
                        className="caption-20"
                        success={!tooltipWarn}
                        tooltip={tooltipText}
                    >
                        <span className="sidebar__hide-on-close">
                            {tooltipText}
                        </span>
                    </Notification>
                </li>
            </ul>
            <hr />
            <ul>
                <li>
                    <button
                        className={(tooltipWarn ? "" : "button-primary")}
                        disabled={!isNewRoundReady}
                        onClick={newRound}
                    >
                        <Icons.Plus/>
                        <span className="sidebar__hide-on-close">
                            &nbsp;New round
                        </span>
                    </button>
                </li>
                <li>
                    <button
                        disabled={roundList.length === 0}
                        onClick={delLastRound}
                    >
                        <Icons.Trash />
                        <span className="sidebar__hide-on-close">
                            &nbsp;Remove last round
                        </span>
                    </button>
                </li>
            </ul>
            <hr />
            <ul>
                <li>
                    <Link to="options">
                        <Icons.Settings />
                        <span className="sidebar__hide-on-close">
                            &nbsp;Options
                        </span>
                    </Link>
                </li>
            </ul>
        </div>
    );
}
Sidebar.propTypes = {
    className: PropTypes.string,
    navigate: PropTypes.func.isRequired
};
