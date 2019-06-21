import React, {useEffect, useState} from "react";
import {Tab, TabList, TabPanel, TabPanels, Tabs} from "@reach/tabs";
import Icons from "../../../components/icons";
import PairPicker from "../pair-picker";
import PropTypes from "prop-types";
import Round from "./round";

export default function RoundPanels({
    activePlayersCount,
    unmatched,
    unmatchedCount,
    unmatchedWithDummy,
    roundId,
    tournament,
    scoreData
}) {
    const initialTab = unmatchedCount === activePlayersCount ? 1 : 0;
    const [openTab, setOpenTab] = useState(initialTab);
    useEffect(
        function autoSwitchTab() {
            if (unmatchedCount === activePlayersCount) {
                setOpenTab(1);
            }
            if (unmatchedCount === 0) {
                setOpenTab(0);
            }
        },
        [unmatchedCount, activePlayersCount]
    );
    return (
        <Tabs index={openTab} onChange={setOpenTab}>
            <TabList>
                <Tab disabled={unmatchedCount === activePlayersCount}>
                    <Icons.List/> Matches
                </Tab>
                <Tab disabled={unmatchedCount === 0}>
                    <Icons.Users/> Unmatched players ({unmatchedCount})
                </Tab>
            </TabList>
            <TabPanels>
                <TabPanel>
                    <Round
                        roundId={roundId}
                        tournament={tournament}
                        scoreData={scoreData}
                    />
                </TabPanel>
                <TabPanel>
                    {unmatchedCount !== 0 &&
                        <PairPicker
                            roundId={roundId}
                            tournament={tournament}
                            unmatched={unmatched}
                            unmatchedWithDummy={unmatchedWithDummy}
                            unmatchedCount={unmatchedCount}
                            scoreData={scoreData}
                        />
                    }
                </TabPanel>
            </TabPanels>
        </Tabs>
    );
}
RoundPanels.propTypes = {
    activePlayersCount: PropTypes.number.isRequired,
    roundId: PropTypes.number.isRequired,
    scoreData: PropTypes.object.isRequired,
    tournament: PropTypes.object.isRequired,
    unmatched: PropTypes.object.isRequired,
    unmatchedCount: PropTypes.number.isRequired,
    unmatchedWithDummy: PropTypes.object.isRequired
};
