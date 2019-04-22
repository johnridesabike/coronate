// @ts-check
import React from "react";

export function Options({
    playerList,
    avoidList,
    tourneyList,
    options,
    setOptions
}) {
    const outputPlayers = JSON.stringify({playerList, avoidList}, null, 2);
    const outputTourney = JSON.stringify(tourneyList, null, 2);
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
                    readOnly
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
                    readOnly
                />
                <input type="submit" value="Load" disabled />
            </fieldset>
            </form>
        </div>
    );
}