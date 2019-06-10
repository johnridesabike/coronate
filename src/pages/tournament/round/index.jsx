import React, {useEffect, useState} from "react";
import {Tab, TabList, TabPanel, TabPanels, Tabs} from "@reach/tabs";
import Icons from "../../../components/icons";
import PairPicker from "../pair-picker";
import PropTypes from "prop-types";
import Round from "./round";
import {getUnmatched} from "../../../data-types";
import {useTournament} from "../../../hooks";

export default function Index(props) {
    const roundId = Number(props.roundId); // Reach Router passes a string.
    const {tourney, activePlayers} = useTournament();
    // only use unmatched players if this is the last round.
    const unmatched = (roundId === tourney.roundList.length - 1)
        ? getUnmatched(tourney.roundList, activePlayers, roundId)
        : {};
    const unmatchedCount = Object.keys(unmatched).length;
    const [openTab, setOpenTab] = useState(0);
    useEffect(
        function () {
            (unmatchedCount > 0) ? setOpenTab(1) : setOpenTab(0);
        },
        [unmatchedCount]
    );
    return (
        <Tabs
            index={openTab}
            onChange={(index) => setOpenTab(index)}
        >
            <TabList>
                <Tab><Icons.List/> Matches</Tab>
                <Tab disabled={unmatchedCount === 0}>
                    <Icons.Users/> Unmatched players
                </Tab>
            </TabList>
            <TabPanels>
                <TabPanel>
                    <Round roundId={roundId}/>
                </TabPanel>
                <TabPanel>
                    <PairPicker roundId={roundId} />
                </TabPanel>
            </TabPanels>
        </Tabs>
    );
}
Index.propTypes = {
    path: PropTypes.string,
    roundId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};
