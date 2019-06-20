import React, {useEffect, useState} from "react";
import {Tab, TabList, TabPanel, TabPanels, Tabs} from "@reach/tabs";
import Icons from "../../../components/icons";
import PairPicker from "../pair-picker";
import PropTypes from "prop-types";
import Round from "./round";
import {getUnmatched} from "../../../data-types";
// import {useTournament} from "../../../hooks";

export default function RoundPanels(props) {
    const roundId = Number(props.roundId); // Reach Router passes a string.
    const {tourney, activePlayers} = props.tournament;
    // only use unmatched players if this is the last round.
    const unmatched = (
        roundId === tourney.roundList.length - 1
        ? getUnmatched(tourney.roundList, activePlayers, roundId)
        : {}
    );
    const unmatchedCount = Object.keys(unmatched).length;
    const activePlayersCount = Object.keys(activePlayers).length;
    const [openTab, setOpenTab] = useState(0);
    useEffect(
        function autoSwitchTab() {
            if (openTab === 0) {
                // If all of the players are unmatched then switch to the
                // pair-picking tab
                unmatchedCount === activePlayersCount
                ? setOpenTab(1)
                : setOpenTab(0);
            }
            if (openTab === 1 && unmatchedCount === 0) {
                setOpenTab(0);
            }
        },
        [unmatchedCount, activePlayersCount, openTab]
    );
    return (
        <Tabs index={openTab} onChange={setOpenTab}>
            <TabList>
                <Tab disabled={unmatchedCount === activePlayersCount}>
                    <Icons.List/> Matches
                </Tab>
                <Tab disabled={unmatchedCount === 0}>
                    <Icons.Users/> Unmatched players
                </Tab>
            </TabList>
            <TabPanels>
                <TabPanel>
                    <Round roundId={roundId} tournament={props.tournament}/>
                </TabPanel>
                <TabPanel>
                    <PairPicker
                        roundId={roundId}
                        tournament={props.tournament}
                    />
                </TabPanel>
            </TabPanels>
        </Tabs>
    );
}
RoundPanels.propTypes = {
    roundId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tournament: PropTypes.object.isRequired
};
