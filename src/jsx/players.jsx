// @ts-check
import React, {useState, Fragment} from "react";
/**
 * @typedef {import("../chess-tourney").PlayerManager} PlayerManager
 * @typedef {import("../chess-tourney").Player} Player
 */
/**
 * @param {Object} props
 * @param {PlayerManager} props.playerManager
 */
export function Players({playerManager}) {
    const [roster, setRoster] = useState(playerManager.playerList);
    const newPlayerDefault = {firstName: "", lastName: "", rating: 1200};
    const [newPlayer, setNewPlayer] = useState(newPlayerDefault);
    /** @type {boolean[]} */
    const defOpen = [];
    const [openPlayers, setOpenPlayers] = useState(defOpen);
    /** @param {React.FormEvent<HTMLElement>} event */
    const handleSubmit = function (event) {
        event.preventDefault();
        playerManager.addPlayer(newPlayer);
        setNewPlayer(newPlayerDefault);
        setRoster([...playerManager.playerList]);
    };
    /** @param {React.ChangeEvent<HTMLInputElement>} event */
    const updateField = function (event) {
        event.preventDefault();
        /** @type {Object<string, string>} */
        let update = {};
        update[event.currentTarget.name] = event.currentTarget.value;
        setNewPlayer(Object.assign({}, newPlayer, update));
    };
    /**
     * @param {React.MouseEvent<HTMLButtonElement, MouseEvent>} event
     * @param {number} id
     */
    const delPlayer = function (event, id) {
        event.preventDefault();
        playerManager.delPlayer(id);
        setRoster([...playerManager.playerList]);
    };
    /** @param {number} id */
    const toggleOpenPlayer = function(id) {
        const newOpenPlayers = [...openPlayers];
        newOpenPlayers[id] = !openPlayers[id];
        setOpenPlayers(newOpenPlayers);
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
                <Fragment key={player.id}>
                    <tr>
                        <td className="table__player">{player.firstName}</td>
                        <td className="table__player">{player.lastName}</td>
                        <td className="table__number">{player.rating}</td>
                        <td>
                            <button
                                onClick={(event) =>
                                    delPlayer(event, player.id)
                                }>
                                x
                            </button>
                        </td>
                        <td>
                            <button
                                onClick={() => toggleOpenPlayer(player.id)}>
                                ?
                            </button>
                        </td>
                    </tr>
                    {openPlayers[player.id] &&
                    <tr>
                        <td colSpan={5}>
                            <PlayerInfoBox player={player}
                                playerManager={playerManager} />
                        </td>
                    </tr>
                    }
                </Fragment>
                )}
            </tbody>
        </table>;
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
                        <input type="text" name="firstName"
                            onChange={updateField}
                            value={newPlayer.firstName} required />
                    </label>
                </p>
                <p>
                    <label>
                        Last name&nbsp;
                        <input type="text" name="lastName"
                            onChange={updateField}
                            value={newPlayer.lastName} required />
                    </label>
                </p>
                <p>
                    <label>
                        Rating&nbsp;
                        <input type="number" name="rating"
                            onChange={updateField}
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

/**
 *
 * @param {Object} props
 * @param {Player} props.player
 * @param {PlayerManager} props.playerManager
 */
function PlayerInfoBox({player, playerManager}) {
    const [avoidList] = useState(
        playerManager.getPlayerAvoidList(player)
    );
    const notAvoidList = playerManager.playerList.filter(
        (p) => !avoidList.includes(p) && player !== p
    );
    return (
        <Fragment>
            <dl>
                <dt>Matches played</dt>
                <dd>{player.matchCount}</dd>
                <dt>K factor</dt>
                <dd>{player.getKFactor()}</dd>
                <dt>Players to avoid</dt>
                <dd>
                    <ul>
                    {avoidList.map((p) =>
                        <li key={p.id}>
                            {p.firstName} {p.lastName}
                        </li>
                    )}
                    {(avoidList.length === 0) &&
                        <li>None</li>
                    }
                    </ul>
                </dd>
            </dl>
            <p>
                Add player to avoid
                <select>
                {notAvoidList.map((player) =>
                    <option key={player.id}>
                        {player.firstName} {player.lastName}
                    </option>
                )}
                </select>
            </p>
        </Fragment>
    );
}