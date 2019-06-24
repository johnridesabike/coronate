import React, {useEffect, useMemo, useState} from "react";
import {WindowBody, useWindowContext} from "../components/window";
import {
    useAllPlayersDb,
    useAllTournamentsDb,
    useOptionsDb
} from "../hooks";
import Icons from "../components/icons";
import classNames from "classnames";
import demoData from "../demo-data";
import fromJSON from "tcomb/lib/fromJSON";
import styles from "./options.module.css";
import testData from "../test-data";
import {types} from "../data-types";

function invalidAlert() {
    window.alert(
        "That data is invalid! A more helpful error message could not be "
        + "written yet."
    );
}

export default function Options(props) {
    const [tournaments, tourneysDispatch] = useAllTournamentsDb();
    const [players, playersDispatch] = useAllPlayersDb();
    const [text, setText] = useState("");
    const [options, optionsDispatch] = useOptionsDb();
    const {winDispatch} = useWindowContext();
    useEffect(
        function setDocumentTitle() {
            winDispatch({title: "Options"});
            return () => winDispatch({title: ""});
        },
        [winDispatch]
    );
    // memoize this so the `useEffect` hook syncs with the correct states
    const exportData = useMemo(
        () => ({options, players, tournaments}),
        [options, tournaments, players]
    );
    useEffect(
        function () {
            setText(JSON.stringify(exportData, null, 4));
        },
        [exportData]
    );
    function loadData(data) {
        tourneysDispatch({
            state: fromJSON(data.tournaments, types.TourneysDb),
            type: "LOAD_STATE"
        });
        optionsDispatch({
            state: fromJSON(data.options, types.OptionsDb),
            type: "LOAD_STATE"
        });
        playersDispatch({
            state: fromJSON(data.players, types.PlayersDb),
            type: "LOAD_STATE"
        });
        window.alert("Data loaded!");
    }
    function handleText(event) {
        event.preventDefault();
        try {
            const importData = JSON.parse(text);
            loadData(importData);
        } catch {
            invalidAlert();
        }
    }
    function handleFile(event) {
        event.preventDefault();
        const reader = new FileReader();
        reader.onload = function (ev) {
            const data = ev.target.result;
            try {
                const importData = JSON.parse(data);
                loadData(importData);
            } catch {
                invalidAlert();
            }
        };
        reader.readAsText(event.currentTarget.files[0]);
        event.currentTarget.value = ""; // so the filename won't linger onscreen
    }
    function reloadDemoData(event) {
        event.preventDefault();
        loadData(demoData);
    }
    function loadTestData(event) {
        event.preventDefault();
        loadData(testData);
    }
    return (
        <WindowBody>
            <div className={classNames(styles.options, "content-area")}>
                <h2>Bye settings</h2>
                <form>
                    <p className="caption-30">
                        Select the default score for a bye round.
                    </p>
                    <label className="monospace body-30">
                        1{" "}
                        <input
                            checked={options.byeValue === 1}
                            type="radio"
                            onChange={() => optionsDispatch({
                                option: "byeValue",
                                type: "SET_OPTION",
                                value: 1
                            })}
                        />
                    </label>
                    <label className="monospace body-30">
                        ½{" "}
                        <input
                            checked={options.byeValue === 0.5}
                            type="radio"
                            onChange={() => optionsDispatch({
                                option: "byeValue",
                                type: "SET_OPTION",
                                value: 0.5
                            })}
                        />
                    </label>
                </form>
                <h2>Manage data</h2>
                <p>
                    <a
                        download="coronate.json"
                        href={
                            "data:application/json,"
                            + encodeURIComponent(JSON.stringify(exportData))
                        }
                    >
                        <Icons.Download /> Export all data
                    </a>
                </p>
                <label htmlFor="file">Load data file:</label>
                <input
                    id="file"
                    name="file"
                    type="file"
                    onChange={handleFile}
                />
                <h2>Danger zone</h2>
                <p className="caption-30">
                    I hope you know what you're doing...
                </p>
                <button onClick={reloadDemoData}>
                    Reset demo data (this erases everything else)
                </button>
                {" "}
                {process.env.NODE_ENV !== "production" &&
                    <button onClick={loadTestData}>Load testing data</button>
                }
                <h3>Advanced: manually edit data</h3>
                <form onSubmit={handleText}>
                    <textarea
                        className="json"
                        cols={50}
                        name="playerdata"
                        rows={25}
                        spellCheck={false}
                        value={text}
                        onChange={(event) => setText(event.currentTarget.value)}
                    />
                    <p>
                        <input type="submit" value="Load" />
                    </p>
                </form>
            </div>
        </WindowBody>
    );
}
