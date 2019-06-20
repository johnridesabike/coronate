import {curry, last} from "ramda";
import {DUMMY_ID} from "../../data-types";
import Icons from "../../components/icons";
import {Link} from "@reach/router";
import PropTypes from "prop-types";
import React from "react";
import classNames from "classnames";
import {isRoundComplete} from "../../data-types";

export default function Sidebar({className, navigate, tournament}) {
    const {
        tourney,
        isItOver,
        isNewRoundReady,
        getPlayer,
        activePlayers,
        playersDispatch,
        tourneyDispatch
    } = tournament;
    const {roundList} = tourney;
    const isComplete = curry(isRoundComplete)(roundList, activePlayers);

    function newRound() {
        const confirmText = (
            "All rounds have completed. Are you sure you want to begin a new "
            + "one?"
        );
        if (isItOver) {
            if (!window.confirm(confirmText)) {
                return;
            }
        }
        tourneyDispatch({type: "ADD_ROUND"});
    }

    async function delLastRound() {
        if (window.confirm("Are you sure you want to delete the last round?")) {
            await navigate(".");
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
        <div className={classNames(className)}>
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
                        <Link to="setup">
                            <Icons.Settings />
                            <span className="sidebar__hide-on-close">
                                &nbsp;Setup
                            </span>
                        </Link>
                    </li>
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
                    {Object.keys(roundList).map((id) =>
                        <li key={id}>
                            <Link to={`round/${id}`}>
                                {Number(id) + 1}
                                {isComplete(Number(id))
                                ? (
                                    <span
                                        className={classNames(
                                            "sidebar__hide-on-close",
                                            "caption-20"
                                        )}
                                    >
                                        &nbsp;Complete&nbsp;<Icons.Check />
                                    </span>
                                ) : (
                                    <span
                                        className={classNames(
                                            "sidebar__hide-on-close",
                                            "caption-20"
                                        )}
                                    >
                                        &nbsp;Not complete&nbsp;<Icons.Alert />
                                    </span>
                                )}
                            </Link>
                        </li>
                    )}
                </ul>
            </nav>
            <hr />
            <ul>
                <li>
                    <button
                        // className={classNames({"button-primary": tooltipWarn})}
                        disabled={!isNewRoundReady}
                        onClick={newRound}
                        style={{width: "100%"}}
                    >
                        <Icons.Plus/>
                        <span className="sidebar__hide-on-close">
                            &nbsp;New round
                        </span>
                    </button>
                </li>
                <li style={{textAlign: "center"}}>
                    <button
                        disabled={roundList.length === 0}
                        onClick={delLastRound}
                        className="button-micro"
                        style={{marginTop: "8px"}}
                    >
                        <Icons.Trash />
                        <span className="sidebar__hide-on-close">
                            &nbsp;Remove last round
                        </span>
                    </button>
                </li>
            </ul>
        </div>
    );
}
Sidebar.propTypes = {
    className: PropTypes.string,
    navigate: PropTypes.func.isRequired,
    tournament: PropTypes.object.isRequired
};
