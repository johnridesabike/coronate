// @ts-check
import React, {useState, useEffect, useContext} from "react";
import numeral from "numeral";
import {BackButton} from "../utility";
import {
    getPlayer,
    getPlayerAvoidList,
    kFactor
} from "../../chess-tourney/player";
import {DataContext} from "../../state/global-state";

export default function PlayerInfoBox({playerId, setOpenPlayer}) {
    const {data, dispatch} = useContext(DataContext);
    const playerList = data.players;
    const avoidList = data.avoid;
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
        setSelectedAvoider(unAvoided()[0]);
        dispatch({
            type: "ADD_AVOID_PAIR",
            pair: [playerId, Number(selectedAvoider)]}
        );
    };
    useEffect(function () {
        setSingAvoidList(getPlayerAvoidList(playerId, avoidList));
    }, [avoidList, playerId]);
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
                <dt>Rating</dt>
                <dd>{getPlayer(playerId, playerList).rating}</dd>
                <dt>K factor</dt>
                <dd>
                    {numeral(
                        kFactor(getPlayer(playerId, playerList).matchCount)
                    ).format("00")}
                </dd>
                <dt>Players to avoid</dt>
                <dd>
                    <ul>
                    {singAvoidList.map((pId) =>
                        <li key={pId}>
                            {getPlayer(pId, playerList).firstName}&nbsp;
                            {getPlayer(pId, playerList).lastName}
                            <button
                                onClick={
                                    () => dispatch({
                                        type: "DEL_AVOID_PAIR",
                                        pair: [playerId, pId]
                                    })
                                }>
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
