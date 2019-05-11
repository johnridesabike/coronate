import React, {useState, useEffect} from "react";
import {Tabs, TabList, Tab, TabPanels, TabPanel} from "@reach/tabs";
import {Link} from "@reach/router";
import last from "ramda/src/last";
import {calcNumOfRounds} from "../../data/utility";
import Round from "./round/";
import PlayerSelect from "./player-select";
import {useData} from "../../state/global-state";
import Scores from "./scores";
import ChevronLeft from "react-feather/dist/icons/chevron-left";
import "@reach/tabs/styles.css";

/**
 * @param {Object} props
 * @param {string} [props.path]
 * @param {number} [props.tourneyId]
 */
export default function Tournament({tourneyId, path}) {
    const {data, dispatch} = useData();
    const tourney = data.tourneys[tourneyId];
    const [defaultTab, setDefaultTab] = useState(0);
    function isNewRoundReady() {
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
    }
    function newRound() {
        dispatch({type: "ADD_ROUND", tourneyId});
        setDefaultTab(tourney.roundList.length + 1);
    }
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
    useEffect(
        function () {
            console.log("rendering tournament.");
        }
    );
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
                    disabled={!isNewRoundReady()}
                >
                    New round
                </button>{" "}
                <button
                    className="danger"
                    onClick={() =>
                        dispatch({type: "DEL_LAST_ROUND", tourneyId})
                    }
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
