// @ts-check
import React, {useState} from "react";

export function Options({
    playerList,
    avoidList,
    tourneyList,
    options,
    setOptions
}) {
    const [outputPlayers, setOutputPlayers] = useState(
        JSON.stringify(playerList, null, 2)
    );
    const [outputTourney, setOutputTourney] = useState(
        JSON.stringify(tourneyList, null, 2)
    );
    return (
        <div>
            <form>
            <fieldset>
                <legend>Bye options</legend>
                Select how many points a bye is worth:&nbsp;
                <input
                    type="number"
                    value={options.byeValue}
                    onChange={
                        (event) => setOptions({
                            byeValue: Number(event.target.value)
                        })
                    }
                    />
            </fieldset>
            </form>
            <form onSubmit={(event) => event.preventDefault()}>
            <fieldset>
                <legend>Export tournament data</legend>
                <textarea
                    className="json"
                    rows={25}
                    cols={50}
                    value={outputTourney}
                    onChange={(event) => setOutputTourney(event.target.value)}
                    name="tourneyData"
                    />
                <input type="submit" value="load" disabled />
            </fieldset>
            </form>
            <form onSubmit={(event) => event.preventDefault()}>
            <fieldset>
                <legend>Export player data</legend>
                <textarea
                    className="json"
                    rows={25}
                    cols={50}
                    value={outputPlayers}
                    name="playerdata"
                    onChange={(event) => setOutputPlayers(event.target.value)}
                />
                <input type="submit" value="Load" disabled />
            </fieldset>
            </form>
        </div>
    );
}