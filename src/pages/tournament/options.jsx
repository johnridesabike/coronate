import {useDocumentTitle, useTournament} from "../../hooks";
import {Link} from "@reach/router";
import React from "react";

export default function Options() {
    const {tourneyDispatch} = useTournament();
    useDocumentTitle("tournament options");
    function changeToOne() {
        tourneyDispatch({
            type: "UPDATE_BYE_SCORES",
            value: 1
        });
        window.alert("Bye value updated to 1.");
    }
    function changeToOneHalf() {
        tourneyDispatch({
            type: "UPDATE_BYE_SCORES",
            value: 0.5
        });
        window.alert("Bye value updated to ½.");
    }
    return (
        <div className="content-area">
            <h2>Change bye scores</h2>
            <button onClick={changeToOne}>Change to 1</button>{" "}
            <button onClick={changeToOneHalf}>Change to ½</button>
            <p className="caption-30">
                This will update all bye matches which have been previously
                scored in this tournament. To change the default bye value in
                future matches, go to the{" "}
                <Link to="/options">app options</Link>.
            </p>
        </div>
    );
}
