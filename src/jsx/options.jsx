// @ts-check
import React, {useState} from "react";
import {createTournament, JSONretriever} from "../chess-tourney";

export function Options({playerManager, tourneyList, setTourneyList, setOpenTourney}) {
    const [outputPlayers, setOutputPlayers] = useState(
        JSON.stringify(playerManager.roster, JSONretriever, 2)
    );
    const [outputTourney, setOutputTourney] = useState(
        JSON.stringify(tourneyList, JSONretriever, 2)
    );
    const loadPlayers = (event) => {
        event.preventDefault();
        let players = JSON.parse(event.target.playerdata.value);
        playerManager.loadPlayerData(players);
    };
    const changedPlayers = (event) => {
        setOutputPlayers(event.target.value);
    };
    const loadTourney = function (event) {
        event.preventDefault();
        let tourneyData = JSON.parse(event.target.tourneyData.value);
        setTourneyList(tourneyData.map((t) => createTournament(t, playerManager)));
        setOpenTourney(null);
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
                    onChange={changedPlayers} />
                <input type="submit" value="Load" />
            </form>
        </section>
    );
}