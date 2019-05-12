import React from "react";
import {render, cleanup, fireEvent} from "react-testing-library";
import "jest-dom/extend-expect";
import {TournamentProvider} from "../../state/tourneys-state";
import TournamentList from "./list";
import "../../__mocks__/getComputedStyle.mock";

afterEach(cleanup);

it("Creating a new tournament works.", function () {
    const {getByText, getByLabelText} = render(
        <TournamentProvider><TournamentList/></TournamentProvider>
    );
    fireEvent.change(
        getByLabelText(/name/i),
        {target: {value: "The battle for Arkham Asylum"}}
    );
    fireEvent.click(getByText(/create/i));
    expect(getByText("The battle for Arkham Asylum")).toBeTruthy();
});

it("Deleting a tournament works.", function () {
    const {getByLabelText, queryByText} = render(
        <TournamentProvider><TournamentList/></TournamentProvider>
    );
    fireEvent.click(getByLabelText(/delete “wayne manor open”/i));
    expect(queryByText(/wayne manor open/i)).toBeFalsy();
});

it("Deleting all tournaments displays a message", function () {
    const {getByText, getByLabelText} = render(
        <TournamentProvider><TournamentList/></TournamentProvider>
    );
    fireEvent.click(getByLabelText(/delete “wayne manor open”/i));
    fireEvent.click(getByLabelText(/delete “the battle for gotham city”/i));
    expect(getByText(/No tournaments added yet./i)).toBeTruthy();
});
