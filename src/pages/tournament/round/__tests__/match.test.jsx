import "jest-dom/extend-expect";
import {cleanup, fireEvent, render} from "@testing-library/react";
import PropTypes from "prop-types";
import React from "react";
import RoundPanels from "../round-panels";
import {TournamentProvider} from "../../../../hooks";

const {change, click} = fireEvent;
afterEach(cleanup);

const BattleForGothamCity = ({children}) => (
    <TournamentProvider tourneyId="tvAdS4YbSOznrBgrg0ITA">
        {children}
    </TournamentProvider>
);
BattleForGothamCity.propTypes = {children: PropTypes.node.isRequired};

it("Ratings are updated correctly after a match", function () {
    const {getByDisplayValue, getByText, getByTestId} = render(
        <BattleForGothamCity><RoundPanels roundId={1} /></BattleForGothamCity>,
    );
    click(getByText(/select bruce wayne/i));
    click(getByText(/select dick grayson/i));
    expect(
        getByTestId("rating-BruceWayne_lv_ZsUHTU9")
    ).toHaveTextContent(/rating: 1998/i);
    expect(
        getByTestId("rating-DickGrayson_1C2rCokHH")
    ).toHaveTextContent(/rating: 1909/i);
    click(getByText(/match selected/i));
    change(getByDisplayValue(/select winner/i), {target: {value: "WHITE"}});
    const info = /view information for match: bruce wayne versus dick grayson/i;
    click(getByText(info));
    expect(
        getByTestId("rating-BruceWayne_lv_ZsUHTU9")
    ).toHaveTextContent("1998 (+33)");
    expect(
        getByTestId("rating-DickGrayson_1C2rCokHH")
    ).toHaveTextContent("1909 (-33)");
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

