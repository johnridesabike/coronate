import "jest-dom/extend-expect";
// import {PlayersProvider, TournamentProvider} from "../../state";
import {cleanup, render} from "react-testing-library";
import React from "react";
import Scores from "../tournament/scores";
import {TournamentProvider} from "../../hooks";
import dashify from "dashify";

afterEach(cleanup);

xit("The tie break scores calculate correctly", function () {
    const {getByTestId} = render(
        <TournamentProvider tourneyId="CaouTNel9k70jUJ0h6SYM">
            <Scores />
        </TournamentProvider>
    );
    const batman = (score) => getByTestId(dashify("Bruce Wayne " + score));
    expect(batman("Modified median")).toHaveTextContent("4");
    expect(batman("Solkoff")).toHaveTextContent("7½");
    expect(batman("Cumulative score")).toHaveTextContent("10");
    expect(batman("Cumulative of opposition")).toHaveTextContent("15");
});

xit("The players are ranked correctly", function () {
    const {getByTestId} = render(
        <TournamentProvider tourneyId="CaouTNel9k70jUJ0h6SYM">
            <Scores />
        </TournamentProvider>
    );
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

xit("Half-scores are rendered correctly", function () {
    const {getByTestId} = render(
        <TournamentProvider tourneyId="CaouTNel9k70jUJ0h6SYM">
            <Scores />
        </TournamentProvider>
    );
    expect(getByTestId("barbara-gordon-score")).toHaveTextContent("2½");
    expect(getByTestId("kate-kane-score")).toHaveTextContent("½");
});
