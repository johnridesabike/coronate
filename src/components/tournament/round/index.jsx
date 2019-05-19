import React, {useState, useEffect} from "react";
import PropTypes from "prop-types";
import {Tab, Tabs, TabList, TabPanel, TabPanels} from "@reach/tabs";
import Icons from "../../icons";
import Round from "./round";
import PairPicker from "../pair-picker";
import {useRound} from "../../../state";

export default function Index({tourneyId, roundId}) {
    // eslint-disable-next-line fp/no-mutation
    tourneyId = Number(tourneyId); // reach router passes a string instead
    // eslint-disable-next-line fp/no-mutation
    roundId = Number(roundId); // reach router passes a string instead
    const {unmatched} = useRound(tourneyId, roundId);
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
                        tourneyId={tourneyId}
                        roundId={roundId}
                    />
                </TabPanel>
                <TabPanel>
                    <PairPicker
                        tourneyId={tourneyId}
                        roundId={roundId}
                    />
                </TabPanel>
            </TabPanels>
        </Tabs>
    );
}
Index.propTypes = {
    tourneyId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    roundId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    path: PropTypes.string
};
