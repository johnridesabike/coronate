import "jest-dom/extend-expect";
import {cleanup, render} from "@testing-library/react";
import PropTypes from "prop-types";
import React from "react";
import Scores from "../scores";
import {TournamentProvider} from "../../../hooks";
import dashify from "dashify";

afterEach(cleanup);

const WaneManorOpen = ({children}) => (
    <TournamentProvider tourneyId="CaouTNel9k70jUJ0h6SYM">
        {children}
    </TournamentProvider>
);
WaneManorOpen.propTypes = {children: PropTypes.node.isRequired};

it("The tie break scores calculate correctly", function () {
    const {getByTestId} = render(<WaneManorOpen><Scores /></WaneManorOpen>);
    const batman = (score) => getByTestId(dashify("Bruce Wayne " + score));
    expect(batman("Median")).toHaveTextContent("4");
    expect(batman("Solkoff")).toHaveTextContent("7½");
    expect(batman("Cumulative score")).toHaveTextContent("10");
    expect(batman("Cumulative of opposition")).toHaveTextContent("15");
});

it("The players are ranked correctly", function () {
    const {getByTestId} = render(<WaneManorOpen><Scores /></WaneManorOpen>);
    expect(getByTestId("0")).toHaveTextContent("Bruce Wayne");
    expect(getByTestId("1")).toHaveTextContent("Selina Kyle");
    expect(getByTestId("2")).toHaveTextContent("Dick Grayson");
    expect(getByTestId("3")).toHaveTextContent("Barbara Gordon");
    expect(getByTestId("4")).toHaveTextContent("Alfred Pennyworth");
    expect(getByTestId("5")).toHaveTextContent("Helena Wayne");
    expect(getByTestId("6")).toHaveTextContent("James Gordon");
    expect(getByTestId("7")).toHaveTextContent("Jason Todd");
    expect(getByTestId("8")).toHaveTextContent("Kate Kane");
});

it("Half-scores are rendered correctly", function () {
    const {getByTestId} = render(<WaneManorOpen><Scores /></WaneManorOpen>);
    expect(getByTestId("barbara-gordon-score")).toHaveTextContent("2½");
    expect(getByTestId("kate-kane-score")).toHaveTextContent("½");
});
