import React from "react";
import {render, cleanup, fireEvent, getNodeText} from "react-testing-library";
import "jest-dom/extend-expect";
import "../../../__mocks__/getComputedStyle.mock";
import PlayerInfoBox from "../../players/info-box";
import Round from "./index";
import Tournament from "../tournament";
import {TestApp} from "../../utility";

afterEach(cleanup);

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
/** @param {JSX.Element} node */
function getRating(node) {
    return getNodeText(render(node).getByLabelText(/rating/i));
}
/** @param {JSX.Element} node */
function getMatchCount(node) {
    return getNodeText(render(node).getByLabelText(/matches played/i));
}
/** @type {string} */
let origRatingBatman;
/** @type {string} */
let origRatingRobin;

it("Original ratings are shown correctly.", function () {
    // get the initial ratings
    origRatingBatman = getRating(batmanInfo);
    cleanup();
    origRatingRobin = getRating(robinInfo);
    expect(origRatingBatman).toBe("1998"); // from demo-players.json
    expect(origRatingRobin).toBe("1909"); // from demo-players.json
});

it("Original match counts are shown correctly.", function () {
    expect(getMatchCount(batmanInfo)).toBe("9"); // from demo-players.json
});

it("Ratings are updated after a match is scored.", function () {
    const container = render(
        <TestApp>
            <Tournament tourneyId={1} />
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

it("Match counts are updated.", function () {
    expect(getMatchCount(batmanInfo)).toBe("10");
});

it("Swapping players colors works.", function () {
    const {getByText, getByTestId} = render(
        <TestApp>
            <Round tourneyId={1} roundId={1} />
        </TestApp>
    );
    fireEvent.click(
        getByText(
            /more information and options for Bruce Wayne versus Dick Grayson/i
        )
    );
    fireEvent.click(getByText(/^swap colors$/i));
    expect(getByTestId("match-0-white")).toHaveTextContent(/dick grayson/i);
});

it("Unmatching players works.", function () {
    const {getByText, queryByText} = render(
        <TestApp>
            <Round tourneyId={1} roundId={1} />
        </TestApp>
    );
    fireEvent.click(
        getByText(
            /more information and options for Dick Grayson versus Bruce Wayne/i
        )
    );
    fireEvent.click(getByText(/^unmatch$/i));
    expect(queryByText(/No players matched yet./i)).toBeInTheDocument();
});

it("Match counts are updated after matches are removed.", function () {
    expect(getMatchCount(batmanInfo)).toBe("9");
});

it("Players are auto-paired correctly", function () {
    // This will need to be updated as the pairing algorithm changes.
    const {getByText, getByTestId} = render(
        <TestApp>
            <Round tourneyId={1} roundId={1} />
        </TestApp>
    );
    fireEvent.click(getByText(/auto-pair/i));
    expect(getByTestId("match-0-white")).toHaveTextContent("Bruce Wayne");
    expect(getByTestId("match-0-black")).toHaveTextContent("Harley Quinn");
    expect(getByTestId("match-1-white")).toHaveTextContent("Joker");
    expect(getByTestId("match-1-black")).toHaveTextContent("Oswald Cobblepot");
    expect(getByTestId("match-2-white")).toHaveTextContent("Kate Kane");
    expect(getByTestId("match-2-black")).toHaveTextContent("Harvey Dent");
    expect(getByTestId("match-3-white")).toHaveTextContent("Alfred Pennyworth");
    expect(getByTestId("match-3-black")).toHaveTextContent("Helena Wayne");
    expect(getByTestId("match-4-white")).toHaveTextContent("Jason Todd");
    expect(getByTestId("match-4-black")).toHaveTextContent("Ra's al Ghul");
    expect(getByTestId("match-5-white")).toHaveTextContent("Selina Kyle");
    expect(getByTestId("match-5-black")).toHaveTextContent("Victor Fries");
    expect(getByTestId("match-6-white")).toHaveTextContent("Dick Grayson");
    expect(getByTestId("match-6-black")).toHaveTextContent("Jonathan Crane");
    expect(getByTestId("match-7-white")).toHaveTextContent("Barbara Gordon");
    expect(getByTestId("match-7-black")).toHaveTextContent("Edward Nigma");
    expect(getByTestId("match-8-white")).toHaveTextContent("James Gordon");
    expect(getByTestId("match-8-black")).toHaveTextContent("Pamela Isley");
});

it("Moving matches works.", function () {
    const {getByText, getByTestId} = render(
        <TestApp>
            <Round tourneyId={1} roundId={1} />
        </TestApp>
    );
    fireEvent.click(
        getByText(
            /more information and options for Bruce Wayne versus Harley Quinn/i
        )
    );
    fireEvent.click(getByText(/^move up$/i)); // shouldn't change
    expect(getByTestId("match-0-white")).toHaveTextContent("Bruce Wayne");
    fireEvent.click(getByText(/^move down$/i));
    expect(getByTestId("match-1-white")).toHaveTextContent("Bruce Wayne");
    fireEvent.click(getByText(/^move up$/i));
    expect(getByTestId("match-0-white")).toHaveTextContent("Bruce Wayne");
    fireEvent.click(
        getByText(
            /more information and options for James Gordon versus Pamela Isley/i
        )
    );
    fireEvent.click(getByText(/^move down$/i)); // shouldn't change
    expect(getByTestId("match-8-white")).toHaveTextContent("James Gordon");
});

