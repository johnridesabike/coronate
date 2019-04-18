// @ts-check
import React, {useState, useEffect, Fragment} from "react";
import {BackButton, OpenButton} from "./utility";
/**
 * @typedef {import("../chess-tourney").PlayerManager} PlayerManager
 * @typedef {import("../chess-tourney").Player} Player
 */

/**
 * @param {Object} props
 * @param {PlayerManager} props.playerManager
 */
export function PlayerView({playerManager}) {
    /** @type {number} */
    const defaultOpen = null;
    const [openPlayer, setOpenPlayer] = useState(defaultOpen);
    if (openPlayer !== null) {
        return <PlayerInfoBox key={openPlayer}
            playerId={openPlayer} setOpenPlayer={setOpenPlayer}
            playerManager={playerManager} />;
    } else {
        return <PlayerList playerManager={playerManager}
            setOpenPlayer={setOpenPlayer} />;
    }
}

/**
 * @param {Object} props
 * @param {PlayerManager} props.playerManager
 * @param {React.Dispatch<React.SetStateAction<number>>} props.setOpenPlayer
 */
export function PlayerList({playerManager, setOpenPlayer}) {
    const [roster, setRoster] = useState(playerManager.playerList);
    const newPlayerDefault = {firstName: "", lastName: "", rating: 1200};
    const [newPlayer, setNewPlayer] = useState(newPlayerDefault);
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
                <tr key={player.id}>
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
                        <OpenButton action={() => setOpenPlayer(player.id)} />
                    </td>
                </tr>
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
 * @param {number} props.playerId
 * @param {PlayerManager} props.playerManager
 * @param {React.Dispatch<React.SetStateAction<number>>} props.setOpenPlayer
 */
function PlayerInfoBox({playerId, playerManager, setOpenPlayer}) {
    const getPlayer = playerManager.getPlayerById;
    const [avoidList, setAvoidList] = useState(
        playerManager.getPlayerAvoidList(playerId)
    );
    const unAvoided = () => playerManager.playerList.filter(
        (p) => !avoidList.includes(p.id) && playerId !== p.id
    );
    const [selectedAvoider, setSelectedAvoider] = useState(unAvoided()[0].id);
    /** @param {React.FormEvent<HTMLFormElement>} event */
    function avoidAdd(event) {
        event.preventDefault();
        playerManager.avoidListAdd(playerId, selectedAvoider);
        setAvoidList(playerManager.getPlayerAvoidList(playerId));
    };
    /** @param {number} avoidPlayer */
    function avoidRemove(avoidPlayer) {
        playerManager.avoidListRemove(playerId, avoidPlayer);
        setAvoidList(playerManager.getPlayerAvoidList(playerId));
    };
    useEffect(function () {
        setSelectedAvoider(unAvoided()[0].id);
    }, [avoidList]);
    return (
        <div>
            <BackButton action={() => setOpenPlayer(null)}/>
            <h2>
                {getPlayer(playerId).firstName} {getPlayer(playerId).lastName}
            </h2>
            <dl>
                <dt>Matches played</dt>
                <dd>{getPlayer(playerId).matchCount}</dd>
                <dt>K factor</dt>
                <dd>{getPlayer(playerId).getKFactor()}</dd>
                <dt>Players to avoid</dt>
                <dd>
                    <ul>
                    {avoidList.map((pId) =>
                        <li key={pId}>
                            {getPlayer(pId).firstName} {getPlayer(pId).lastName}
                            <button onClick={() => avoidRemove(pId)}>
                                x
                            </button>
                        </li>
                    )}
                    {(avoidList.length === 0) &&
                        <li>None</li>
                    }
                    </ul>
                </dd>
            </dl>
            <form onSubmit={(event) => avoidAdd(event)}>
                Add player to avoid
                <select>
                {unAvoided().map((player) =>
                    <option key={player.id} value={player.id}
                        onBlur={() => setSelectedAvoider(player.id)}>
                        {player.firstName} {player.lastName}
                    </option>
                )}
                </select>
                <input type="submit" value="Add"/>
            </form>
        </div>
    );
}
