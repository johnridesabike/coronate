import "jest-dom/extend-expect";
import {cleanup, fireEvent, render} from "@testing-library/react";
import Players from "../index";
import React from "react";
import {navigate} from "@reach/router";

const {change, click} = fireEvent;
afterEach(cleanup);

it("Adding avoid pairs works", async function () {
    const {getByText, getByLabelText} = render(<Players />);
    await navigate("/players/Newbie_McNewberson___");
    change(getByLabelText(
        /Select a new player to avoid/i,
        {target: {value: "Grandy_McMaster______"}}
    ));
    click(getByText(/^add$/i));
    expect(getByText(/grandy mcmaster/i)).toBeInTheDocument();
});
