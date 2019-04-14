// @ts-check
import React, {useState, Fragment} from "react";
/**
 * @typedef {import("react")} React
 * @typedef {import("../chess-tourney").PlayerManager} PlayerManager
 */

export function Players(props) {
    /** @type {PlayerManager} */
    const playerManager = props.playerManager;
    const [roster, setRoster] = useState(playerManager.roster);
    const newPlayerDefault = {firstName: "", lastName: "", rating: 1200};
    const [newPlayer, setNewPlayer] = useState(newPlayerDefault);
    /** @param {React.FormEvent<HTMLElement>} event */
    const handleSubmit = function (event) {
        event.preventDefault();
        playerManager.addPlayer(newPlayer);
        setNewPlayer(newPlayerDefault);
        setRoster([...playerManager.roster]);
    };
    /** @param {React.FormEvent<HTMLInputElement>} event */
    const updateField = function (event) {
        event.preventDefault();
        /** @type {Object<string, string>} */
        let update = {};
        update[event.currentTarget.name] = event.currentTarget.value
        setNewPlayer(Object.assign({}, newPlayer, update));
    };
    /** @param {React.MouseEvent<HTMLButtonElement, MouseEvent>} event */
    const delPlayer = function (event) {
        event.preventDefault();
        playerManager.delPlayer(Number(event.currentTarget.dataset.id));
        setRoster([...playerManager.roster]);
    };
    let rosterTable = <Fragment></Fragment>;
    if (roster.length > 0) {
        rosterTable = 
        <table>
            <caption>Demo Roster</caption>
            <thead>
                <tr>
                <th>First name</th>
                <th>Last name</th>
                <th>Rating</th>
                <th></th>
                <th></th>
                </tr>
            </thead>
            <tbody>
                {roster.map((player) =>
                <tr key={player.id} >
                    <td className="table__player">{player.firstName}</td>
                    <td className="table__player">{player.lastName}</td>
                    <td className="table__number">{player.rating}</td>
                    <td>
                        <button 
                            data-id={player.id}
                            onClick={delPlayer}>
                            x
                        </button>
                    </td>
                    <td></td>
                </tr>
                )}
            </tbody>
        </table>
    }
    return (
        <div className="roster">
            {rosterTable}
            <p>
                Add your own players:
            </p>
            <form onSubmit={handleSubmit}>
                <p>
                    <label>
                        First name&nbsp;
                        <input type="text" name="firstName" onChange={updateField}
                            value={newPlayer.firstName} required />
                    </label>
                </p>
                <p>
                    <label>
                        Last name&nbsp;
                        <input type="text" name="lastName" onChange={updateField}
                            value={newPlayer.lastName} required />
                    </label>
                </p>
                <p>
                    <label>
                        Rating&nbsp;
                        <input type="number" name="rating" onChange={updateField}
                            value={newPlayer.rating} required />
                    </label>
                </p>
                <p>
                    <input type="submit" value="Add"/>
                </p>
            </form>
        </div>
    );
}
