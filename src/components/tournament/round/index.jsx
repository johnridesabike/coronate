import React, {useEffect, useState} from "react";
import {Tab, TabList, TabPanel, TabPanels, Tabs} from "@reach/tabs";
import {useRound, useTournament} from "../../../hooks";
import Icons from "../../icons";
import PairPicker from "../pair-picker";
import PropTypes from "prop-types";
import Round from "./round";

export default function Index(props) {
    const roundId = Number(props.roundId);
    const {tourney} = useTournament();
    const {unmatched} = useRound(tourney, roundId);
    const [openTab, setOpenTab] = useState(0);
    useEffect(
        function () {
            if (unmatched.length > 0) {
                setOpenTab(1);
            } else {
                setOpenTab(0);
            }
        },
        [unmatched.length]
    );
    return (
        <Tabs index={openTab} onChange={(index) => setOpenTab(index)}>
            <TabList>
                <Tab><Icons.List/> Matches</Tab>
                <Tab disabled={unmatched.length === 0}>
                    <Icons.Users/> Unmatched players
                </Tab>
            </TabList>
            <TabPanels>
                <TabPanel>
                    <Round
                        roundId={roundId}
                    />
                </TabPanel>
                <TabPanel>
                    <PairPicker
                        roundId={roundId}
                    />
                </TabPanel>
            </TabPanels>
        </Tabs>
    );
}
Index.propTypes = {
    path: PropTypes.string,
    roundId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};
