import React, {useState, useEffect, useMemo} from "react";
import {Tabs, TabList, Tab, TabPanels, TabPanel} from "@reach/tabs";
import Tooltip from "@reach/tooltip";
import {Link, Redirect} from "@reach/router";
import last from "ramda/src/last";
import Check from "react-feather/dist/icons/check-circle";
import Alert from "react-feather/dist/icons/alert-circle";
import ChevronLeft from "react-feather/dist/icons/chevron-left";
import Round from "./round/";
import Scores from "./scores";
import PlayerSelect from "./player-select/index";
import {useTournament, usePlayers} from "../../state";
import {calcNumOfRounds} from "../../data/utility";
import "@reach/tabs/styles.css";
import "@reach/tooltip/styles.css";

/**
 * @param {Object} props
 * @param {string} [props.path]
 * @param {number} [props.tourneyId]
 */
export default function Tournament({tourneyId}) {
    tourneyId = Number(tourneyId); // reach router passes a string instead.
    const [tourney, dispatch] = useTournament(tourneyId);
    const {name, players, roundList} = tourney;
    const {playerState} = usePlayers();
    const [openTab, setOpenTab] = useState(0);
    // This isn't expensive, but why not memoize it?
    const isNewRoundReady = useMemo(
        function () {
            if (!tourney) {
                return false;
            }
            const lastRound = last(roundList);
            if (!lastRound) {
                return true;
            }
            const matchedPlayers = lastRound.reduce(
                /** @param {number[]} acc */
                (acc, match) => acc.concat(match.players),
                []
            );
            const unMatchedPlayers = players.filter(
                (pId) => !matchedPlayers.includes(pId)
            );
            const results = lastRound.map(
                (match) => match.result[0] + match.result[1]
            );
            return (unMatchedPlayers.length === 0 && !results.includes(0));
        },
        [tourney, players, roundList]
    );
    useEffect(
        function () {
            const origTitle = document.title;
            document.title = name;
            return function () {
                document.title = origTitle;
            };
        },
        [name]
    );
    useEffect(
        function () {
            if (roundList.length > 0) {
                setOpenTab(roundList.length + 1);
            }
        },
        [roundList.length]
    );
    const isItOver = roundList.length >= calcNumOfRounds(players.length);
    let tooltipText = "";
    let tooltipWarn = false;
    if (!isNewRoundReady) {
        tooltipText = `You must complete the last round before beginning a new
        one.`;
        tooltipWarn = true;
    } else if (isItOver) {
        tooltipText = "All necessary rounds have completed.";
        tooltipWarn = true;
    } else {
        tooltipText = "Ready to begin a new round.";
    }
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
        dispatch({type: "ADD_ROUND", tourneyId});
        setOpenTab(roundList.length + 1);
        return;
    }
    function delLastRound() {
        if (window.confirm("Are you sure you want to delete the last round?")) {
            dispatch({
                type: "DEL_LAST_ROUND",
                players: playerState.players,
                tourneyId
            });
        }
    }
    if (!tourney) {
        return <Redirect to="/" />;
    }
    return (
        <Tabs index={openTab} onChange={(index) => setOpenTab(index)}>
            <div>
                <Link to="/">
                    <ChevronLeft/> Back
                </Link>
                <h2>{name}</h2>
                Round progress: {roundList.length}/
                {calcNumOfRounds(players.length)}{" "}
                <button
                    onClick={newRound}
                    disabled={!isNewRoundReady}
                >
                    New round
                </button>{" "}
                <Tooltip label={tooltipText}>
                    <span className="helpIcon">
                        {(tooltipWarn) ? <Alert /> : <Check />}
                    </span>
                </Tooltip>{" "}
                <button
                    className="danger"
                    onClick={delLastRound}
                    disabled={roundList.length === 0}
                >
                    Remove last round
                </button>
            </div>
            <TabList>
                <Tab>Players</Tab>
                <Tab>Scores</Tab>
                {Object.keys(roundList).map((id) => (
                    <Tab key={id}>Round {Number(id) + 1}</Tab>
                ))}
            </TabList>
            <TabPanels>
                <TabPanel>
                    <PlayerSelect tourneyId={tourneyId} />
                </TabPanel>
                <TabPanel>
                    <Scores tourneyId={tourneyId} />
                </TabPanel>
                {Object.keys(roundList).map((id) => (
                    <TabPanel key={id}>
                        <Round roundId={Number(id)} tourneyId={tourneyId} />
                    </TabPanel>
                ))}
            </TabPanels>
        </Tabs>
    );
}
