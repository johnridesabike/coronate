import "./styles";
import * as serviceWorker from "./serviceWorker";
import React, {StrictMode} from "react";
import {make as App} from "./App.bs.js";
import ReactDOM from "react-dom";

ReactDOM.render(
    <StrictMode><App /></StrictMode>,
    document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
