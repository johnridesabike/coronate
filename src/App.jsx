// @ts-check
import React, {useReducer} from "react";
import "./App.css";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import "@reach/tabs/styles.css";
import TournamentList from "./components/tournament/list";
import PlayerView from "./components/players/index";
import {Options} from "./components/options";
import {defaultData, dataReducer, DataContext} from "./state/global-state";

function App() {
    const [data, dispatch] = useReducer(dataReducer, defaultData);
    return (
        <React.StrictMode>
            <DataContext.Provider value={{data, dispatch}}>
                <Tabs className="app" defaultIndex={1}>
                    <footer className="caution footer">
                        <Caution />
                    </footer>
                    <TabList className="header">
                        <Tab>Players</Tab>
                        <Tab>Tournaments</Tab>
                        <Tab>Options</Tab>
                        <Tab>About</Tab>
                    </TabList>
                    <TabPanels className="content">
                        <TabPanel>
                            <PlayerView />
                        </TabPanel>
                        <TabPanel>
                            <TournamentList />
                        </TabPanel>
                        <TabPanel>
                            <Options />
                        </TabPanel>
                        <TabPanel>
                            <p>
                                {/* eslint-disable-next-line max-len*/}
                                This is an early, proof-of-concept, demo of a chess tournament manager. <a href="https://github.com/johnridesabike/chessahoochee">You can find out more here.</a>
                            </p>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </DataContext.Provider>
        </React.StrictMode>
    );
}

function Caution() {
    return (
        <p>
            <span role="img" aria-label="warning">⚠️</span>
            {" "}
            This is an unstable demo build.
            {" "}
            <span role="img" aria-label="warning">⚠️</span>
            {" "}
            Want to help make it better? Head to the
            {" "}
            <span role="img" aria-label="finger pointing right">👉</span>
            {" "}
            <a href="https://github.com/johnridesabike/chessahoochee">
                Git repository
            </a>.
        </p>
    );
}

export {App, Caution};
