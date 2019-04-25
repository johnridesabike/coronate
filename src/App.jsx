// @ts-check
import React, {useReducer} from "react";
import "./App.css";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import "@reach/tabs/styles.css";
import {TournamentList} from "./jsx/tournament/index";
import {PlayerView} from "./jsx/players.jsx";
import {Options} from "./jsx/options";
import {defaultData, dataReducer, DataContext} from "./global-state";

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

export const RedTab = (props) => <Tab {...props} style={{ color: "red" }} />;

function Caution() {
    return (
        <p>
            <span role="img" aria-label="warning">⚠️</span>&nbsp;
            This is an unstable demo build.&nbsp;
            <span role="img" aria-label="warning">⚠️</span>&nbsp;
            Want to help make it better? Head to the&nbsp;
            <span role="img" aria-label="finger pointing right">👉</span>&nbsp;
            <a href="https://github.com/johnridesabike/chessahoochee">
                Git repository
            </a>.
        </p>
    );
}

export {App, Caution};
