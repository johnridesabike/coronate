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

it("Ratings are updated after a match is scored.", function() {
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
    // get the initial ratings
    const origRatingBatman = getNodeText(
        render(batmanInfo).getByLabelText(/rating/i)
    );
    cleanup();
    const origRatingRobin = getNodeText(
        render(robinInfo).getByLabelText(/rating/i)
    );
    cleanup();
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
    const newRatingBatman = getNodeText(
        render(batmanInfo).getByLabelText(/rating/i)
    );
    cleanup();
    const newRatingRobin = getNodeText(
        render(robinInfo).getByLabelText(/rating/i)
    );
    expect(Number(newRatingBatman)).toBeGreaterThan(Number(origRatingBatman));
    expect(Number(newRatingRobin)).toBeLessThan(Number(origRatingRobin));
});
