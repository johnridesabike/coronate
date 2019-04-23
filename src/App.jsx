// @ts-check
import React, { useState, useEffect } from "react";
import "./App.css";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import "@reach/tabs/styles.css";
import demoRoster from "./demo-players.json";
import demoTourneyList from "./demo-tourney.json";
import createPlayer from "./chess-tourney/player";
import {cleanAvoidList} from "./chess-tourney/player";
import {TournamentList} from "./jsx/tournament/index";
import {PlayerView} from "./jsx/players.jsx";
import {Options} from "./jsx/options";
import demoOptions from "./demo-options.json";

function App() {
    const [playerList, setPlayerList] = useState(
        demoRoster.playerList.map((p) => createPlayer(p))
    );
    const [avoidList, setAvoidList] = useState(demoRoster.avoidList);
    const [tourneyList, setTourneyList] = useState(demoTourneyList);
    const [options, setOptions] = useState(demoOptions);
    useEffect(function () {
        // remove stale IDs
        setAvoidList(cleanAvoidList(avoidList, playerList));
    }, [playerList]);
    return (
        <React.StrictMode>
        <Tabs className="app" defaultIndex={1}>
            <TabList className="header">
                <Tab>Players</Tab>
                <Tab>Tournaments</Tab>
                <Tab>Options</Tab>
                <Tab>About</Tab>
            </TabList>
            <TabPanels className="content">
                <TabPanel>
                    <PlayerView
                        playerList={playerList}
                        setPlayerList={setPlayerList}
                        avoidList={avoidList}
                        setAvoidList={setAvoidList}/>
                </TabPanel>
                <TabPanel>
                    <TournamentList
                        playerList={playerList}
                        setPlayerList={setPlayerList}
                        avoidList={avoidList}
                        tourneyList={tourneyList}
                        setTourneyList={setTourneyList}
                        options={options}/>
                </TabPanel>
                <TabPanel>
                    <Options
                        playerList={playerList}
                        avoidList={avoidList}
                        tourneyList={tourneyList}
                        options={options}
                        setOptions={setOptions}
                    />
                </TabPanel>
                <TabPanel>
                    <p>
                        {/* eslint-disable-next-line max-len*/}
                        This is an early, proof-of-concept, demo of a chess tournament manager. <a href="https://github.com/johnridesabike/chessahoochee">You can find out more here.</a>
                    </p>
                </TabPanel>
            </TabPanels>
            <footer className="caution footer">
                <Caution />
            </footer>
        </Tabs>
        </React.StrictMode>
    );
}

export const RedTab = (props) => <Tab {...props} style={{ color: "red" }} />;

function Caution() {
    return (
        <p>
            <span role="img" aria-label="waving hand">👋</span>&nbsp;
            This is an unstable demo build!
            Want to help make it better? Head to the&nbsp;
            <span role="img" aria-label="finger pointing right">👉</span>&nbsp;
            <a href="https://github.com/johnridesabike/chessahoochee">
                Git repository
            </a>.
        </p>
    );
}

export {App, Caution};
