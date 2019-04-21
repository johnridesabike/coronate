// @ts-check
import React, {useState} from "react";
export function Options({
    playerList,
    avoidList,
    tourneyList,
}) {
    const [outputPlayers, setOutputPlayers] = useState(
        JSON.stringify(playerList, null, 2)
    );
    const [outputTourney, setOutputTourney] = useState(
        JSON.stringify(tourneyList, null, 2)
    );
    return (
        <section>
            <h2>Export tournament data</h2>
            <form onSubmit={(event) => event.preventDefault()}>
                <textarea
                    className="json"
                    rows={25}
                    cols={50}
                    value={outputTourney}
                    onChange={(event) => setOutputTourney(event.target.value)}
                    name="tourneyData"
                    />
                <input type="submit" value="load" disabled />
            </form>
            <h2>Export player data</h2>
            <form onSubmit={(event) => event.preventDefault()}>
                <textarea
                    className="json"
                    rows={25}
                    cols={50}
                    value={outputPlayers}
                    name="playerdata"
                    onChange={(event) => setOutputPlayers(event.target.value)}
                />
                <input type="submit" value="Load" disabled />
            </form>
        </section>
    );
}