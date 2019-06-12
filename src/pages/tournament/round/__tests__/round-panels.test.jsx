import "jest-dom/extend-expect";
import {cleanup, fireEvent, render} from "@testing-library/react";
// import PlayerInfoBox from "../../players/player-profile";
import PropTypes from "prop-types";
import React from "react";
import RoundPanels from "../round-panels";
import {TournamentProvider} from "../../../../hooks";

const {click} = fireEvent;
afterEach(cleanup);

const BattleForGothamCity = ({children}) => (
    <TournamentProvider tourneyId="tvAdS4YbSOznrBgrg0ITA">
        {children}
    </TournamentProvider>
);
BattleForGothamCity.propTypes = {children: PropTypes.node.isRequired};

it("Tabs auto-change correctly", function () {
    const {getByText} = render(
        <BattleForGothamCity><RoundPanels roundId={1} /></BattleForGothamCity>,
    );
    const selectTab = getByText(/^unmatched players$/i);
    const matchesTab = getByText(/^matches$/i);
    // When no players are matched, it defaults to the pair-picker tab
    expect(selectTab).toHaveAttribute("aria-selected", "true");
    click(getByText(/add bruce wayne/i));
    click(getByText(/add dick grayson/i));
    click(getByText(/^match selected$/i));
    // Tab doesn't change focus if there are still players to be matched.
    expect(selectTab).toHaveAttribute("aria-selected", "true");
    click(getByText(/add alfred pennyworth/i));
    click(getByText(/add barbara gordon/i));
    click(getByText(/^match selected$/i));
    click(matchesTab);
    expect(matchesTab).toHaveAttribute("aria-selected", "true");
    click(getByText(/edit match for bruce wayne versus dick grayson/i));
    click(getByText(/^unmatch$/i));
    // The tab selection doesn't change if there are still matched players
    expect(matchesTab).toHaveAttribute("aria-selected", "true");
    click(getByText(/edit match for alfred pennyworth versus barbara gordon/i));
    click(getByText(/^unmatch$/i));
    // The tab selection changes when all players have been unmatched
    expect(matchesTab).toHaveAttribute("aria-selected", "false");
    click(getByText(/^auto-pair unmatched players$/i));
    // The tab selection changes when all players have been paired
    expect(selectTab).toHaveAttribute("aria-selected", "false");
});
