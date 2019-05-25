import "jest-dom/extend-expect";
import {cleanup, fireEvent, render} from "react-testing-library";
import PlayerInfoBox from "../../players/info-box";
import PropTypes from "prop-types";
import React from "react";
import RoundPanels from "./index";
import {TournamentProvider} from "../../../hooks";

const {click, change} = fireEvent;
afterEach(cleanup);

const AllTheProviders = ({children}) => (
    <TournamentProvider tourneyId="CaouTNel9k70jUJ0h6SYM">
        {children}
    </TournamentProvider>
);
AllTheProviders.propTypes = {
    children: PropTypes.node
};

const batmanInfo = (
    <PlayerInfoBox playerId={0} />
);
const robinInfo = (
    <PlayerInfoBox playerId={1} />
);

function getRating(node) {
    return render(
        node,
        {wrapper: AllTheProviders}
    ).getByLabelText(/rating/i).value;
}

function getMatchCount(node) {
    return render(
        node,
        {wrapper: AllTheProviders}
    ).getByLabelText(/matches played/i).value;
}

it("Original ratings are shown correctly.", function () {
    const origRatingBatman = getRating(batmanInfo);
    cleanup();
    const origRatingRobin = getRating(robinInfo);
    expect(origRatingBatman).toBe("1998"); // from demo-players.json
    expect(origRatingRobin).toBe("1909"); // from demo-players.json
});

it("Original match counts are shown correctly.", function () {
    expect(getMatchCount(batmanInfo)).toBe("9"); // from demo-players.json
});

it("Ratings are updated after a match is scored.", function () {
    const {getByText, getByDisplayValue, getByTestId} = render(
        <RoundPanels roundId={1} tourneyId={1} />,
        {wrapper: AllTheProviders}
    );
    click(getByText(/^unmatched players$/i));
    click(getByText(/select bruce wayne/i));
    click(getByText(/select dick grayson/i));
    click(getByText(/match selected/i));
    click(getByText(/matches/i));
    change(getByDisplayValue(/select a winner/i), {target: {value: "WHITE"}});
    click(getByText(
        /view information for match: bruce wayne versus dick grayson/i
    ));
    expect(getByTestId("rating-0")).toHaveTextContent("1998 (+33)");
    expect(getByTestId("rating-1")).toHaveTextContent("1909 (-33)");
});

// it("Match counts are updated.", function () {
//     expect(getMatchCount(batmanInfo)).toBe("10");
// });

// it("Swapping players colors works.", function () {
//     const {getByLabelText, getByTestId} = render(
//         <TestApp>
//             <Round tourneyId={1} roundId={1} />
//         </TestApp>
//     );
//     fireEvent.click(
//         getByLabelText(
//             /open information for Bruce Wayne versus Dick Grayson/i
//         )
//     );
//     fireEvent.click(getByLabelText(/^swap colors$/i));
//     expect(getByTestId("match-0-white")).toHaveTextContent(/dick grayson/i);
// });

// it("Unmatching players works.", function () {
//     const {getByLabelText, queryByText} = render(
//         <TestApp>
//             <Round tourneyId={1} roundId={1} />
//         </TestApp>
//     );
//     fireEvent.click(
//         getByLabelText(
//             /open information for Dick Grayson versus Bruce Wayne/i
//         )
//     );
//     fireEvent.click(getByLabelText(/^unmatch$/i));
//     expect(queryByText(/No players matched yet./i)).toBeInTheDocument();
// });

// it("Match counts are updated after matches are removed.", function () {
//     expect(getMatchCount(batmanInfo)).toBe("9");
// });

it("Players are auto-paired correctly", function () {
    // This will need to be updated as the pairing algorithm changes.
    const {getByText, getByTestId} = render(
        <RoundPanels roundId={1} tourneyId={1} />,
        {wrapper: AllTheProviders}
    );
    fireEvent.click(getByText(/auto-pair unmatched players/i));
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

// it("Moving matches works.", function () {
//     const {getByLabelText, getByTestId} = render(
//         <TestApp>
//             <Round tourneyId={1} roundId={1} />
//         </TestApp>
//     );
//     fireEvent.click(
//         getByLabelText(
//             /open information for Bruce Wayne versus Harley Quinn/i
//         )
//     );
//     fireEvent.click(getByLabelText(/^move up$/i)); // shouldn't change
//     expect(getByTestId("match-0-white")).toHaveTextContent("Bruce Wayne");
//     fireEvent.click(getByLabelText(/^move down$/i));
//     expect(getByTestId("match-1-white")).toHaveTextContent("Bruce Wayne");
//     fireEvent.click(getByLabelText(/^move up$/i));
//     expect(getByTestId("match-0-white")).toHaveTextContent("Bruce Wayne");
//     fireEvent.click(
//         getByLabelText(
//             /open information for James Gordon versus Pamela Isley/i
//         )
//     );
//     fireEvent.click(getByLabelText(/^move down$/i)); // shouldn't change
//     expect(getByTestId("match-8-white")).toHaveTextContent("James Gordon");
// });

