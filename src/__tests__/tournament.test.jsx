import React from "react";
import {render, cleanup, fireEvent} from "react-testing-library";
import {TestApp} from "../components/utility";
import TournamentList from "../components/tournament/list";

afterEach(cleanup);

it("Creating a new tournament works", function () {
    const name = "The battle for Arkham Asylum";
    const {getByText, getByLabelText, queryByText} = render(
        <TestApp><TournamentList/></TestApp>
    );
    fireEvent.change(
        getByLabelText(/name/i),
        {target: {value: name}}
    );
    fireEvent.click(getByText(/create/i));
    expect(queryByText(name)).toBeTruthy();
});
