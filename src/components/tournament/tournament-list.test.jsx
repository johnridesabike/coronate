// "The tests here mostly don't work because of IndexedDB is async.
// If you know how to fix them, please help me out!
// https://github.com/johnridesabike/chessahoochee/issues
import "jest-dom/extend-expect";
import {
    act,
    cleanup,
    fireEvent,
    render,
    waitForElementToBeRemoved
} from "react-testing-library";
import React from "react";
import TournamentList from "./tournament-list";

afterEach(cleanup);
// const container = document.createElement("div");
// document.body.appendChild(container);

xit("Creating a new tournament works.", async function () {
    const {getByText, getByLabelText, container} = render(<div/>);
    act(function () {
        render(<TournamentList/>, {container});
    });
    await waitForElementToBeRemoved(
        () => getByText(/No tournaments added yet/i),
        container
    );
    fireEvent.change(
        getByLabelText(/name/i),
        {target: {value: "The battle for Arkham Asylum"}}
    );
    fireEvent.click(getByText(/create/i));
    expect(getByText("The battle for Arkham Asylum")).toBeInTheDocument();
});

xit("Deleting a tournament works.", async function () {
    const {getByLabelText, queryByText} = render(
        <TournamentList/>
    );
    fireEvent.click(getByLabelText(/delete “wayne manor open”/i));
    expect(queryByText(/wayne manor open/i)).not.toBeInTheDocument();
});

xit("Deleting all tournaments displays a message", async function () {
    const {getByText, getByLabelText} = render(
        <TournamentList/>
    );
    fireEvent.click(getByLabelText(/delete “wayne manor open”/i));
    fireEvent.click(getByLabelText(/delete “the battle for gotham city”/i));
    expect(getByText(/No tournaments added yet./i)).toBeInTheDocument();
});
