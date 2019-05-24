import "jest-dom/extend-expect";
import {cleanup, render} from "react-testing-library";
import App from "./App.jsx";
import React from "react";

afterEach(cleanup);

it("renders without crashing", function () {
    render(<App />);
});
