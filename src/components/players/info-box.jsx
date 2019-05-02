// @ts-check
import React, {useState, useEffect, useContext} from "react";
import numeral from "numeral";
import curry from "ramda/src/curry";
import {BackButton} from "../utility";
import {
    getPlayerById,
    getPlayerAvoidList,
    kFactor
} from "../../data/player";
import {DataContext} from "../../state/global-state";

/**
 * @param {Object} props
 * @param {number} props.playerId
 * @param {React.Dispatch<React.SetStateAction<number>>} [props.setOpenPlayer]
 */
export default function PlayerInfoBox({playerId, setOpenPlayer}) {
    const {data, dispatch} = useContext(DataContext);
    // const playerList = data.players;
    const getPlayer = curry(getPlayerById)(data.players);
    const avoidList = data.avoid;
    const [singAvoidList, setSingAvoidList] = useState(
        getPlayerAvoidList(playerId, avoidList)
    );
    const unAvoided = () => data.players.map(
        (player) => player.id
    ).filter(
        (pId) => !singAvoidList.includes(pId) && pId !== playerId
    );
    const [selectedAvoider, setSelectedAvoider] = useState(unAvoided()[0]);
    /** @param {React.FormEvent<HTMLFormElement>} event */
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
                {getPlayer(playerId).firstName}
                {" "}
                {getPlayer(playerId).lastName}
            </h2>
            <dl>
                <dt>Matches played</dt>
                <dd>{getPlayer(playerId).matchCount}</dd>
                <dt id="rating">Rating</dt>
                <dd aria-labelledby="rating">{getPlayer(playerId).rating}</dd>
                <dt>K factor</dt>
                <dd>
                    {numeral(
                        kFactor(getPlayer(playerId).matchCount)
                    ).format("00")}
                </dd>
                <dt>Players to avoid</dt>
                <dd>
                    <ul>
                        {singAvoidList.map((pId) =>
                            <li key={pId}>
                                {getPlayer(pId).firstName}
                                {" "}
                                {getPlayer(pId).lastName}
                                <button
                                    className="danger"
                                    onClick={
                                        () => dispatch({
                                            type: "DEL_AVOID_PAIR",
                                            pair: [playerId, pId]
                                        })
                                    }>
                                remove
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
                        onBlur={
                            (event) => setSelectedAvoider(event.target.value)
                        }>
                        {unAvoided().map((pId) =>
                            <option key={pId} value={pId}>
                                {getPlayer(pId).firstName}
                                {" "}
                                {getPlayer(pId).lastName}
                            </option>
                        )}
                    </select>
                    <input type="submit" value="Add"/>
                </fieldset>
            </form>
        </div>
    );
}
