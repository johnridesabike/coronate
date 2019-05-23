import React, {useEffect, useMemo} from "react";
import {DUMMY_ID} from "../../data-types";
import Icons from "../icons";
import {Link} from "@reach/router";
import PropTypes from "prop-types";
import Tooltip from "@reach/tooltip";
import {calcNumOfRounds} from "../../pairing-scoring";
import last from "ramda/src/last";
import {useTournament} from "../../hooks";

export default function Sidebar(props) {
    const {
        tourney,
        players,
        getPlayer,
        playersDispatch,
        tourneyDispatch
    } = useTournament();
    const dispatch = tourneyDispatch;
    const {roundList} = tourney;
    // const {playerState, getPlayer, playerDispatch} = usePlayers();

    // This isn't expensive, but why not memoize it?
    const isNewRoundReady = useMemo(
        function () {
            const lastRound = last(roundList);
            if (!lastRound) {
                return true;
            }
            const matchedPlayers = lastRound.reduce(
                (acc, match) => acc.concat(match.players),
                []
            );
            const unMatchedPlayers = Object.keys(players).filter(
                (pId) => !matchedPlayers.includes(Number(pId))
            );
            const results = lastRound.map(
                (match) => match.result[0] + match.result[1]
            );
            return (unMatchedPlayers.length === 0 && !results.includes(0));
        },
        [players, roundList]
    );
    useEffect(
        function () {
            const origTitle = document.title;
            document.title = tourney.name;
            return function () {
                document.title = origTitle;
            };
        },
        [tourney.name]
    );
    const isItOver = (
        roundList.length >= calcNumOfRounds(Object.keys(players).length)
    );
    const [tooltipText, tooltipWarn] = (function () {
        if (!isNewRoundReady) {
            return [
                "You must complete the last round before beginning a new one.",
                true
            ];
        } else if (isItOver) {
            return ["All necessary rounds have completed.", true];
        } else {
            return ["Ready to begin a new round.", false];
        }
    }());

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
        dispatch({type: "ADD_ROUND"});
        return;
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
                match.players.forEach(function (pId, color) {
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
            dispatch({type: "DEL_LAST_ROUND"});
        }
    }

    return (
        <div className={props.className}>
            <nav>
                <ul>
                    <li>
                        <Link to=".">
                            <Icons.Users /> Players
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
                            <Link to={`${id}`}>
                            Round {Number(id) + 1}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <hr />
            <ul>
                <li>
                    <button
                        onClick={newRound}
                        disabled={!isNewRoundReady}
                    >
                        <Icons.Plus/> New round
                    </button>{" "}
                    <Tooltip label={tooltipText}>
                        <span className="helpIcon">
                            {(tooltipWarn)
                            ? <Icons.Alert className="status-alert" />
                            : <Icons.Check className="status-ok" />
                            }
                        </span>
                    </Tooltip>
                </li>
                <li>
                    <button
                        className={"danger"}
                        onClick={delLastRound}
                        disabled={roundList.length === 0}
                    >
                        <Icons.Trash /> Remove last round
                    </button>
                </li>
                <li>
                Round progress: {roundList.length}/
                    {calcNumOfRounds(Object.keys(players).length)}{" "}
                </li>
            </ul>
        </div>
    );
}
Sidebar.propTypes = {
    className: PropTypes.string,
    navigate: PropTypes.func.isRequired
};
