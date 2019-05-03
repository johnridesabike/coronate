// @ts-check
import React, {useReducer} from "react";
import "../__mocks__/getComputedStyle.mock";
import {render, cleanup, fireEvent, getNodeText} from "react-testing-library";
import PlayerInfoBox from "../components/players/info-box";
import Round from "../components/tournament/round";
import TournamentTabs from "../components/tournament/tabs";
import {dataReducer, defaultData, DataContext} from "../state/global-state";

afterEach(cleanup);

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
function TestApp({children}) {
    const [data, dispatch] = useReducer(dataReducer, defaultData);
    return (
        <DataContext.Provider value={{data, dispatch}}>
            {children}
        </DataContext.Provider>
    );
}
const batmanInfo = (
    <TestApp>
        <PlayerInfoBox playerId={0} />
    </TestApp>
);
const robinInfo = (
    <TestApp>
        <PlayerInfoBox playerId={1} />
    </TestApp>
);
function getRating(node) {
    return getNodeText(render(node).getByLabelText(/rating/i));
}
function getMatchCount(node) {
    return getNodeText(render(node).getByLabelText(/matches played/i));
}

let origRatingBatman;
let origRatingRobin;

it("Original ratings are shown correctly.", function() {
    // get the initial ratings
    origRatingBatman = getRating(batmanInfo);
    cleanup();
    origRatingRobin = getRating(robinInfo);
    expect(origRatingBatman).toBe("1998"); // from demo-players.json
    expect(origRatingRobin).toBe("1909"); // from demo-players.json
});

it("Original match counts are shown correctly.", function() {
    expect(getMatchCount(batmanInfo)).toBe("9"); // from demo-players.json
});

it("Ratings are updated after a match is scored.", function() {
    const container = render(
        <TestApp>
            <TournamentTabs tourneyId={1} />
        </TestApp>
    );
    fireEvent.click(container.getByText("New round"));
    fireEvent.click(container.getByText("Round 2"));
    // We're just rendering the specific round because reach renders all of its
    // tabs at once, causing react-testing-library to collect text from every
    // tab, not just the selected one.
    cleanup();
    const round = render(
        <TestApp>
            <Round tourneyId={1} roundId={1} />
        </TestApp>
    );
    fireEvent.click(round.getByText("Bruce Wayne"));
    fireEvent.click(round.getByText("Dick Grayson"));
    fireEvent.click(round.getByText("Pair checked"));
    fireEvent.click(
        round.getByText("Set result for Bruce Wayne versus Dick Grayson")
    );
    fireEvent.click(round.getByText("Bruce Wayne won"));
    cleanup();
    const newRatingBatman = getRating(batmanInfo);
    cleanup();
    const newRatingRobin = getRating(robinInfo);
    expect(Number(newRatingBatman)).toBeGreaterThan(Number(origRatingBatman));
    expect(Number(newRatingRobin)).toBeLessThan(Number(origRatingRobin));
});

it("Match counts are updated.", function() {
    expect(getMatchCount(batmanInfo)).toBe("10");
});
