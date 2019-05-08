import React, {useContext, useState, useEffect} from "react";
import {Tabs, TabList, Tab, TabPanels, TabPanel} from "@reach/tabs";
import {calcNumOfRounds} from "../../data/utility";
import Round from "./round";
import PlayerSelect from "./player-select";
import {DataContext} from "../../state/global-state";
import Scores from "./scores";

/**
 * @param {Object} props
 * @param {number} props.tourneyId
 * @param {React.ReactNode} [props.backButton]
 */
export default function TournamentTabs({tourneyId, backButton}) {
    const {data, dispatch} = useContext(DataContext);
    const tourney = data.tourneys[tourneyId];
    const players = tourney.players;
    const [defaultTab, setDefaultTab] = useState(0);
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
    return (
        <Tabs defaultIndex={defaultTab}>
            <div>
                {backButton}
                <h2>{tourney.name}</h2>
                Round progress: {tourney.roundList.length}/
                {calcNumOfRounds(players.length)}{" "}
                <button onClick={() => newRound()}>New round</button>{" "}
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
