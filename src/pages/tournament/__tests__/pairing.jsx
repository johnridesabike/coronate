import "jest-dom/extend-expect";
import {cleanup, fireEvent, render} from "@testing-library/react";
// import PlayerInfoBox from "../../players/player-profile";
import PropTypes from "prop-types";
import React from "react";
import RoundPanels from "../round";
import {TournamentProvider} from "../../../hooks";

const {click} = fireEvent;
afterEach(cleanup);

const BattleForGothamCity = ({children}) => (
    <TournamentProvider tourneyId="tvAdS4YbSOznrBgrg0ITA">
        {children}
    </TournamentProvider>
);
BattleForGothamCity.propTypes = {children: PropTypes.node.isRequired};

it("Players are auto-paired correctly", function () {
    // This will need to be updated as the pairing algorithm changes.
    const {getByText, getByTestId} = render(
        <BattleForGothamCity><RoundPanels roundId={1} /></BattleForGothamCity>,
    );
    click(getByText(/auto-pair unmatched players/i));
    expect(getByTestId("match-0-white")).toHaveTextContent("Bruce Wayne");
    expect(getByTestId("match-0-black")).toHaveTextContent("Harley Quinn");
    // TODO: Some of these provide two options because the players have an equal
    // match ideal, so which one gets picked is an implementation detail.
    // In the future, the pairing algorithm could be modified to avoid
    // ambiguities like that
    expect(getByTestId("match-1-white")).toHaveTextContent(/Kate Kane|Joker/);
    expect(getByTestId("match-1-black")).toHaveTextContent("Oswald Cobblepot");
    expect(getByTestId("match-2-white")).toHaveTextContent(/Kate Kane|Joker/);
    expect(getByTestId("match-2-black")).toHaveTextContent("Harvey Dent");
    expect(getByTestId("match-3-white")).toHaveTextContent("Alfred Pennyworth");
    expect(getByTestId("match-3-black")).toHaveTextContent("Helena Wayne");
    expect(getByTestId("match-4-white")).toHaveTextContent("Jason Todd");
    expect(getByTestId("match-4-black")).toHaveTextContent("Ra's al Ghul");
    expect(getByTestId("match-5-white")).toHaveTextContent("Selina Kyle");
    expect(
        getByTestId("match-5-black")
    ).toHaveTextContent(/Pamela Isley|Victor Fries/);
    expect(getByTestId("match-6-white")).toHaveTextContent("Dick Grayson");
    expect(
        getByTestId("match-6-black")
    ).toHaveTextContent(/Jonathan Crane|Victor Fries/);
    expect(getByTestId("match-7-white")).toHaveTextContent("Barbara Gordon");
    expect(
        getByTestId("match-7-black")
    ).toHaveTextContent(/Edward Nigma|Jonathan Crane/);
    expect(getByTestId("match-8-white")).toHaveTextContent("James Gordon");
    expect(
        getByTestId("match-8-black")
    ).toHaveTextContent(/Pamela Isley|Edward Nigma/);
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

it("Auto-matching with bye players works", function () {
    const {getByText, getByTestId} = render(
        <BattleForGothamCity><RoundPanels roundId={1} /></BattleForGothamCity>,
    );
    click(getByText(/add or remove players from the roster/i));
    click(getByText(/select hugo strange/i));
    click(getByText(/^done$/i));
    click(getByText(/auto-pair unmatched players/i));
    expect(getByTestId("match-9-black")).toHaveTextContent("Bye Player");
});
