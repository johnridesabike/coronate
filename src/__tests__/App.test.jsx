import React from "react";
import {render, cleanup} from "react-testing-library";
import "jest-dom/extend-expect";
import App from "../App.jsx";

afterEach(cleanup);

it("renders without crashing", function () {
    render(<App />);
});
