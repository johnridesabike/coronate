import React, {useEffect, useMemo, useState} from "react";
import {useAllPlayersDb, useOptionsDb} from "../hooks";
import {createPlayer} from "../data-types";
import defaultOptions from "../state/demo-options.json";
import defaultPlayers from "../state/demo-players.json";
import defaultTourneys from "../state/demo-tourney.json";
import {useTournaments} from "../state";

export function Options(props) {
    const [tourneys, tourneysDispatch] = useTournaments();
    const [players, setPlayers] = useAllPlayersDb();
    const [text, setText] = useState("");
    const [options, opitionsDispatch] = useOptionsDb();
    // memoize this so the `useEffect` hook syncs with the correct state
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
        tourneysDispatch({state: data.tourneys, type: "LOAD_STATE"});
        opitionsDispatch({state: data.options, type: "LOAD_STATE"});
        setPlayers(data.players);
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
        loadData({
            options: defaultOptions,
            playerState: {
                avoid: defaultPlayers.avoidList,
                players: defaultPlayers.playerList.map((p) => createPlayer(p))
            },
            tourneys: defaultTourneys
        });
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
                            type="radio"
                            checked={options.byeValue === 1}
                            onChange={() => opitionsDispatch({
                                option: "byeValue",
                                type: "SET_OPTION",
                                value: 1
                            })}
                        />
                    </label>{" "}
                    <label>
                        ½
                        <input
                            type="radio"
                            checked={options.byeValue === 0.5}
                            onChange={() => opitionsDispatch({
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
                        href={
                            "data:application/json,"
                            + encodeURIComponent(JSON.stringify(exportData))
                        }
                        download="chessahoochee.json"
                    >
                        Download all data
                    </a>
                </p>
                <label>
                    Load data file:{" "}
                    <input type="file" id="file" onChange={handleFile}/>
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
                        rows={25}
                        cols={50}
                        value={text}
                        name="playerdata"
                        onChange={(event) => setText(event.currentTarget.value)}
                        spellCheck={false}
                    />
                    <p>
                        <input type="submit" value="Load" />
                    </p>
                </fieldset>
            </form>
        </div>
    );
}
