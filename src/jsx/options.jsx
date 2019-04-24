// @ts-check
import React, {useContext} from "react";
import {DataContext} from "../global-state";

export function Options() {
    const {data, dispatch} = useContext(DataContext);
    const options = data.options;
    const outputData = JSON.stringify(data, null, 2);
    // const outputTourney = JSON.stringify(tourneyList, null, 2);
    function updateByeValue(value) {
        dispatch({
            type: "SET_BYE_VALUE",
            byeValue: value
        });
    }
    return (
        <div>
            <form>
            <fieldset>
                <legend>Bye options</legend>
                Select how many points a bye is worth:&nbsp;
                <label>
                    1
                    <input
                        type="radio"
                        checked={options.byeValue === 1}
                        onChange={() => updateByeValue(1)} />
                </label>
                <label>
                    0.5
                    <input
                        type="radio"
                        checked={options.byeValue === 0.5}
                        onChange={() => updateByeValue(0.5)} />
                </label>
            </fieldset>
            </form>
            {/* <form onSubmit={(event) => event.preventDefault()}>
            <fieldset>
                <legend>Export tournaments</legend>
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
            </form> */}
            <form onSubmit={(event) => event.preventDefault()}>
            <fieldset>
                <legend>Export data</legend>
                <textarea
                    className="json"
                    rows={25}
                    cols={50}
                    value={outputData}
                    name="playerdata"
                    readOnly
                />
                <input type="submit" value="Load" disabled />
            </fieldset>
            </form>
        </div>
    );
}