// @ts-check
import React, {useState, useEffect, Fragment} from "react";
import {BackButton, OpenButton} from "./utility";
import createPlayer, {
    getPlayer,
    getPlayerAvoidList,
    kFactor
} from "../chess-tourney/player";

/**
 * @param {Object} props
 */
export function PlayerView({
    playerList,
    setPlayerList,
    avoidList,
    setAvoidList
}) {
    /** @type {number} */
    const defaultOpen = null;
    const [openPlayer, setOpenPlayer] = useState(defaultOpen);
    if (openPlayer !== null) {
        return <PlayerInfoBox
            key={openPlayer}
            playerId={openPlayer}
            setOpenPlayer={setOpenPlayer}
            playerList={playerList}
            avoidList={avoidList}
            setAvoidList={setAvoidList} />;
    } else {
        return <PlayerList
            playerList={playerList}
            setPlayerList={setPlayerList}
            setOpenPlayer={setOpenPlayer}/>;
    }
}

/**
 * @param {Object} props
 */
export function PlayerList({
    playerList,
    setPlayerList,
    setOpenPlayer
}) {
    const newPlayerDefault = {firstName: "", lastName: "", rating: 1200};
    const [newPlayerData, setNewPlayerdata] = useState(newPlayerDefault);
    const ids = playerList.map((p) => p.id);
    ids.sort((a, b) => a - b);
    ids.reverse();
    const [nextId, setNextId] = useState(ids[0] + 1);
    const handleSubmit = function (event) {
        event.preventDefault();
        const newPlayer = createPlayer(newPlayerData);
        newPlayer.id = nextId;
        setNextId((prevId) => prevId + 1);
        setNewPlayerdata(newPlayerDefault);
        setPlayerList(playerList.concat(newPlayer));
    };
    const updateField = function (event) {
        event.preventDefault();
        /** @type {Object<string, string>} */
        let update = {};
        update[event.currentTarget.name] = event.currentTarget.value;
        setNewPlayerdata(Object.assign({}, newPlayerData, update));
    };
    const delPlayer = function (event, player) {
        event.preventDefault();
        const index = playerList.indexOf(player);
        playerList.splice(index, 1);
        setPlayerList([...playerList]);
    };
    let rosterTable = <Fragment></Fragment>;
    if (playerList.length > 0) {
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
            {playerList.map((player) =>
                <tr key={player.id}>
                    <td className="table__player">{player.firstName}</td>
                    <td className="table__player">{player.lastName}</td>
                    <td className="table__number">{player.rating}</td>
                    <td>
                        <button
                            className="danger"
                            onClick={(event) =>
                                delPlayer(event, player)
                            }>
                            delete
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
            <form onSubmit={handleSubmit}>
            <fieldset>
                <legend>Add your own players</legend>
                <p>
                    <label>
                        First name&nbsp;
                        <input type="text" name="firstName"
                            onChange={updateField}
                            value={newPlayerData.firstName} required />
                    </label>
                </p>
                <p>
                    <label>
                        Last name&nbsp;
                        <input type="text" name="lastName"
                            onChange={updateField}
                            value={newPlayerData.lastName} required />
                    </label>
                </p>
                <p>
                    <label>
                        Rating&nbsp;
                        <input type="number" name="rating"
                            onChange={updateField}
                            value={newPlayerData.rating} required />
                    </label>
                </p>
                <p>
                    <input type="submit" value="Add"/>
                </p>
            </fieldset>
            </form>
        </div>
    );
}

/**
 *
 * @param {Object} props
 */
function PlayerInfoBox({
    playerId,
    playerList,
    setOpenPlayer,
    avoidList,
    setAvoidList
}) {
    const [singAvoidList, setSingAvoidList] = useState(
        getPlayerAvoidList(playerId, avoidList)
    );
    const unAvoided = () => playerList.map(
        (player) => player.id
    ).filter(
        (pId) => !singAvoidList.includes(pId) && pId !== playerId
    );
    const [selectedAvoider, setSelectedAvoider] = useState(unAvoided()[0]);
    function avoidAdd(event) {
        event.preventDefault();
        avoidList.push([playerId, Number(selectedAvoider)]);
        setAvoidList([...avoidList]);
    };
    /** @param {number} avoidPlayer */
    function avoidRemove(avoidPlayer) {
        setAvoidList(avoidList.filter(
            (pair) => !(pair.includes(playerId) && pair.includes(avoidPlayer))
        ));
    };
    useEffect(function () {
        setSelectedAvoider(unAvoided()[0]);
        setSingAvoidList(getPlayerAvoidList(playerId, avoidList));
    }, [avoidList]);
    return (
        <div>
            <BackButton action={() => setOpenPlayer(null)}/>
            <h2>
                {getPlayer(playerId, playerList).firstName}&nbsp;
                {getPlayer(playerId, playerList).lastName}
            </h2>
            <dl>
                <dt>Matches played</dt>
                <dd>{getPlayer(playerId, playerList).matchCount}</dd>
                <dt>K factor</dt>
                <dd>{kFactor(getPlayer(playerId, playerList).matchCount)}</dd>
                <dt>Players to avoid</dt>
                <dd>
                    <ul>
                    {singAvoidList.map((pId) =>
                        <li key={pId}>
                            {getPlayer(pId, playerList).firstName}&nbsp;
                            {getPlayer(pId, playerList).lastName}
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
            <fieldset>
                <legend>Add player to avoid</legend>
                <select
                    onBlur={(event) => setSelectedAvoider(event.target.value)}>
                {unAvoided().map((pId) =>
                    <option key={pId} value={pId}>
                        {getPlayer(pId, playerList).firstName}&nbsp;
                        {getPlayer(pId, playerList).lastName}
                    </option>
                )}
                </select>
                <input type="submit" value="Add"/>
            </fieldset>
            </form>
        </div>
    );
}
