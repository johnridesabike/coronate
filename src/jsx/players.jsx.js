import React, {useState, Fragment} from "react";

export function Players({playerManager}) {
    const [roster, setRoster] = useState(playerManager.roster);
    const newPlayerDefault = {firstName: "", lastName: "", rating: 1200};
    const [newPlayer, setNewPlayer] = useState(newPlayerDefault);
    const handleSubmit = function (event) {
        event.preventDefault();
        playerManager.addPlayer(newPlayer);
        setNewPlayer(newPlayerDefault);
        setRoster([...playerManager.roster]);
    };
    const updateField = function (event) {
        let update = {};
        update[event.target.name] = event.target.value
        setNewPlayer(Object.assign({}, newPlayer, update));
    };
    const delPlayer = function (event) {
        playerManager.delPlayer(event.target.dataset.id);
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
