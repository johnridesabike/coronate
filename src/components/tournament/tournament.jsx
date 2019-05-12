import React, {useState, useEffect, useMemo} from "react";
import {Tabs, TabList, Tab, TabPanels, TabPanel} from "@reach/tabs";
import Tooltip from "@reach/tooltip";
import {Link} from "@reach/router";
import last from "ramda/src/last";
import Check from "react-feather/dist/icons/check-circle";
import Alert from "react-feather/dist/icons/alert-circle";
import {calcNumOfRounds} from "../../data/utility";
import Round from "./round/";
import PlayerSelect from "./player-select/index";
import {useTournament} from "../../state/tourneys-state";
import {usePlayers} from "../../state/player-state";
import Scores from "./scores";
import ChevronLeft from "react-feather/dist/icons/chevron-left";
import "@reach/tabs/styles.css";
import "@reach/tooltip/styles.css";

/**
 * @param {Object} props
 * @param {string} [props.path]
 * @param {number} [props.tourneyId]
 */
export default function Tournament({tourneyId, path}) {
    tourneyId = Number(tourneyId); // reach router passes a string instead.
    const [tourney, dispatch] = useTournament(tourneyId);
    const {playerState} = usePlayers();
    const [defaultTab, setDefaultTab] = useState(0);
    // This isn't that expensive, but why not memoize it?
    const isNewRoundReady = useMemo(
        function () {
            const lastRound = last(tourney.roundList);
            if (!lastRound) {
                return true;
            }
            const matchedPlayers = lastRound.reduce(
                /** @param {number[]} acc */
                (acc, match) => acc.concat(match.players),
                []
            );
            const unMatchedPlayers = tourney.players.filter(
                (pId) => !matchedPlayers.includes(pId)
            );
            const results = lastRound.map(
                (match) => match.result[0] + match.result[1]
            );
            return (unMatchedPlayers.length === 0 && !results.includes(0));
        },
        [tourney.players, tourney.roundList]
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
    function newRound() {
        dispatch({type: "ADD_ROUND", tourneyId});
        setDefaultTab(tourney.roundList.length + 1);
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
    return (
        <Tabs defaultIndex={defaultTab}>
            <div>
                <Link to="/">
                    <ChevronLeft/> Back
                </Link>
                <h2>{tourney.name}</h2>
                Round progress: {tourney.roundList.length}/
                {calcNumOfRounds(tourney.players.length)}{" "}
                <button
                    onClick={newRound}
                    disabled={!isNewRoundReady}
                >
                    New round
                </button>{" "}
                <Tooltip
                    label={(
                        (isNewRoundReady)
                        ? "Ready to begin a new round."
                        // eslint-disable-next-line max-len
                        : "You must complete the last round before beginning a new one."
                    )}
                >
                    <span>
                        {(
                            (isNewRoundReady)
                            ? <Check />
                            : <Alert />
                        )}
                    </span>
                </Tooltip>{" "}
                <button
                    className="danger"
                    onClick={delLastRound}
                    disabled={tourney.roundList.length === 0}
                >
                    Remove last round
                </button>
            </div>
            <TabList>
                <Tab>Players</Tab>
                <Tab>Scores</Tab>
                {Object.keys(tourney.roundList).map((id) => (
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
                {Object.keys(tourney.roundList).map((id) => (
                    <TabPanel key={id}>
                        <Round roundId={Number(id)} tourneyId={tourneyId} />
                    </TabPanel>
                ))}
            </TabPanels>
        </Tabs>
    );
}
