import React from "react";
import {useTournaments, useOptions, usePlayers} from "../state";

/**
 * @param {Object} props
 */
// eslint-disable-next-line no-unused-vars
export function Options(props) {
    const [tourneys] = useTournaments();
    const [options, dispatch] = useOptions();
    const {playerState} = usePlayers();
    const exportData = {options, tourneys, playerState};
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
                            onChange={() => dispatch({
                                type: "SET_BYE_VALUE",
                                byeValue: 1
                            })}
                        />
                    </label>{" "}
                    <label>
                        ½
                        <input
                            type="radio"
                            checked={options.byeValue === 0.5}
                            onChange={() => dispatch({
                                type: "SET_BYE_VALUE",
                                byeValue: 0.5
                            })}
                        />
                    </label>
                </fieldset>
            </form>
            <form onSubmit={(event) => event.preventDefault()}>
                <fieldset>
                    <legend>Export data</legend>
                    <textarea
                        className="json"
                        rows={25}
                        cols={50}
                        value={JSON.stringify(exportData, null, 2)}
                        name="playerdata"
                        readOnly />
                    <input type="submit" value="Load" disabled />
                </fieldset>
            </form>
        </div>
    );
}
