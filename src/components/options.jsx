import React, {useEffect, useMemo, useState} from "react";
import {useAllPlayersDb, useAllTournamentsDb, useOptionsDb} from "../hooks";
import demoData from "../demo-data";

export default function Options(props) {
    const [tourneys, tourneysDispatch] = useAllTournamentsDb();
    const [players, playersDispatch] = useAllPlayersDb();
    const [text, setText] = useState("");
    const [options, optionsDispatch] = useOptionsDb();
    // memoize this so the `useEffect` hook syncs with the correct states
    const exportData = useMemo(
        () => ({options, players, tourneys}),
        [options, tourneys, players]
    );
    useEffect(
        function () {
            setText(JSON.stringify(exportData, null, 4));
        },
        [exportData]
    );
    function loadData(data) {
        tourneysDispatch({state: data.tournaments, type: "LOAD_STATE"});
        optionsDispatch({state: data.options, type: "LOAD_STATE"});
        playersDispatch({state: data.players, type: "LOAD_STATE"});
        window.alert("Data loaded!");
    }
    function handleText(event) {
        event.preventDefault();
        const importData = JSON.parse(text);
        loadData(importData);
    }
    function handleFile(event) {
        event.preventDefault();
        const reader = new FileReader();
        // eslint-disable-next-line fp/no-mutation
        reader.onload = function (ev) {
            const data = ev.target.result;
            const importData = JSON.parse(data);
            loadData(importData);
        };
        reader.readAsText(event.currentTarget.files[0]);
        event.currentTarget.value = ""; // so the filename won't linger onscreen
    }
    function reloadDemoData(event) {
        event.preventDefault();
        loadData(demoData);
    }
    return (
        <div>
            <form>
                <fieldset>
                    <legend>Bye options</legend>
                    Select how many points a bye is worth:{" "}
                    <label>
                        1
                        <input
                            checked={options.byeValue === 1}
                            type="radio"
                            onChange={() => optionsDispatch({
                                option: "byeValue",
                                type: "SET_OPTION",
                                value: 1
                            })}
                        />
                    </label>{" "}
                    <label>
                        ½
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
                </fieldset>
            </form>
            <fieldset>
                <legend>Manage data</legend>
                <p>
                    <a
                        download="chessahoochee.json"
                        href={
                            "data:application/json,"
                            + encodeURIComponent(JSON.stringify(exportData))
                        }
                    >
                        Download all data
                    </a>
                </p>
                <label>
                    Load data file:{" "}
                    <input id="file" type="file" onChange={handleFile}/>
                </label>
            </fieldset>
            <fieldset>
                <legend>Reset all changes</legend>
                <button onClick={reloadDemoData}>Reload demo data</button>
            </fieldset>
            <form onSubmit={handleText}>
                <fieldset>
                    <legend>
                        Advanced: manually edit data
                    </legend>
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
                </fieldset>
            </form>
        </div>
    );
}
