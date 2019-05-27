import "jest-dom/extend-expect";
import {cleanup, render} from "react-testing-library";
import App from "./App.jsx";
import React from "react";

afterEach(cleanup);

it("renders without crashing", function () {
    render(<App />);
});

console.log("The tests here mostly don't work because of IndexedDB is async.");
console.log("If you know how to fix them, please help me out!");
console.log("https://github.com/johnridesabike/chessahoochee/issues");
