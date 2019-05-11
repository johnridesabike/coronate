import React from "react";
import {render, cleanup} from "react-testing-library";
import "jest-dom/extend-expect";
import dashify from "dashify";
import {DataProvider} from "../../state/global-state";
import {PlayersProvider} from "../../state/player-state";
import Scores from "../tournament/scores";

afterEach(cleanup);

it("The tie break scores calculate correctly", function () {
    const {getByTestId} = render(
        <PlayersProvider>
            <DataProvider>
                <Scores tourneyId={0} />
            </DataProvider>
        </PlayersProvider>
    );
    /** @param {string} score */
    const batman = (score) => getByTestId(dashify("Bruce Wayne " + score));
    expect(batman("Modified median")).toHaveTextContent("4");
    expect(batman("Solkoff")).toHaveTextContent("7½");
    expect(batman("Cumulative score")).toHaveTextContent("10");
    expect(batman("Cumulative of opposition")).toHaveTextContent("15");
});

it("The players are ranked correctly", function () {
    const {getByTestId} = render(
        <PlayersProvider>
            <DataProvider>
                <Scores tourneyId={0} />
            </DataProvider>
        </PlayersProvider>
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

it("Half-scores are rendered correctly", function () {
    const {getByTestId} = render(
        <PlayersProvider>
            <DataProvider>
                <Scores tourneyId={0} />
            </DataProvider>
        </PlayersProvider>
    );
    expect(getByTestId("barbara-gordon-score")).toHaveTextContent("2½");
    expect(getByTestId("kate-kane-score")).toHaveTextContent("½");
});
