import "jest-dom/extend-expect";
import {cleanup, fireEvent, render} from "@testing-library/react";
import React from "react";
import TournamentList from "./tournament-list";

afterEach(cleanup);

it("Creating a new tournament works.", async function () {
    const {getByText, getByLabelText} = render(<TournamentList/>);
    fireEvent.click(getByText(/Add tournament/i));
    fireEvent.change(
        getByLabelText(/name/i),
        {target: {value: "The battle for Arkham Asylum"}}
    );
    fireEvent.click(getByText(/create/i));
    expect(
        getByLabelText(/Delete “The battle for Arkham Asylum”/i)
    ).toBeInTheDocument();
});

it("Deleting a tournament works.", async function () {
    const {getByLabelText, queryByText} = render(<TournamentList/>);
    fireEvent.click(getByLabelText(/delete “wayne manor open”/i));
    expect(queryByText(/wayne manor open/i)).not.toBeInTheDocument();
});

it("Deleting all tournaments displays a message", async function () {
    const {getByText, getByLabelText} = render(<TournamentList/>);
    fireEvent.click(getByLabelText(/delete “wayne manor open”/i));
    fireEvent.click(getByLabelText(/delete “the battle for gotham city”/i));
    expect(getByText(/No tournaments added yet./i)).toBeInTheDocument();
});
