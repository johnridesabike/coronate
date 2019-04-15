// @ts-check
import React, {useState} from "react";
import {createTournament, JSONretriever} from "../chess-tourney";
/**
 * @typedef {import("react")} React
 * @typedef {import("../chess-tourney").PlayerManager} PlayerManager
 * @typedef {import("../chess-tourney").Tournament} Tournament
 */
/**
 * @param {Object} props
 * @param {PlayerManager} props.playerManager
 * @param {Tournament[]} props.tourneyList
 * @param {React.Dispatch<React.SetStateAction<Tournament[]>>} props.setTourneyList
 * @param {React.Dispatch<React.SetStateAction<Tournament>>} props.setOpenTourney
 */
export function Options({
    playerManager,
    tourneyList,
    setTourneyList,
    setOpenTourney
}) {
    const [outputPlayers, setOutputPlayers] = useState(
        JSON.stringify(playerManager.roster, JSONretriever, 2)
    );
    const [outputTourney, setOutputTourney] = useState(
        JSON.stringify(tourneyList, JSONretriever, 2)
    );
    /** @param {React.FormEvent<HTMLElement>} event */
    const loadPlayers = (event) => {
        event.preventDefault();
        let players = JSON.parse(outputPlayers);
        playerManager.loadPlayerData(players);
    };
    /** @param {React.FormEvent<HTMLElement>} event */
    const loadTourney = function (event) {
        event.preventDefault();
        let tourneyData = JSON.parse(outputTourney);
        setTourneyList(
            // @ts-ignore // Don't type-check the JSON-parsed data pls.
            tourneyData.map((t) => createTournament(t, playerManager))
        );
        setOpenTourney(null); // reset this so stale data doesn't persist
    };
    return (
        <section>
            <h2>Export tournament data</h2>
            <form onSubmit={loadTourney}>
                <textarea
                    className="json"
                    rows={25}
                    cols={50}
                    value={outputTourney}
                    onChange={(event) => setOutputTourney(event.target.value)}
                    name="tourneyData"
                    />
                <input type="submit" value="load" />
            </form>
            <h2>Export player data</h2>
            <form onSubmit={loadPlayers}>
                <textarea
                    className="json"
                    rows={25}
                    cols={50}
                    value={outputPlayers}
                    name="playerdata"
                    onChange={(event) => setOutputPlayers(event.target.value)}
                />
                <input type="submit" value="Load" />
            </form>
        </section>
    );
}