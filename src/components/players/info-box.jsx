import React, {useMemo, useState, useEffect} from "react";
import numeral from "numeral";
import curry from "ramda/src/curry";
import {Link} from "@reach/router";
import ChevronLeft from "react-feather/dist/icons/chevron-left";
import Trash from "react-feather/dist/icons/trash-2";
import {getPlayerById, getPlayerAvoidList, kFactor} from "../../data/player";
import {usePlayers} from "../../state/player-state";

/**
 * @param {Object} props
 * @param {string | number} [props.playerId]
 * @param {string} [props.path]
 */
export default function PlayerInfoBox(props) {
    const playerId = Number(props.playerId);
    const {playerState, playerDispatch} = usePlayers();
    const getPlayer = curry(getPlayerById)(playerState.players);
    const avoidList = playerState.avoid;
    const [singAvoidList, setSingAvoidList] = useState(
        getPlayerAvoidList(playerId, avoidList)
    );
    const unAvoided = useMemo(
        () => (
            playerState.players.map(
                (player) => player.id
            ).filter(
                (pId) => !singAvoidList.includes(pId) && pId !== playerId
            )
        ),
        [playerState.players, playerId, singAvoidList]
    );
    const [selectedAvoider, setSelectedAvoider] = useState(unAvoided[0]);
    /** @param {React.FormEvent<HTMLFormElement>} event */
    function avoidAdd(event) {
        event.preventDefault();
        playerDispatch({
            type: "ADD_AVOID_PAIR",
            pair: [playerId, Number(selectedAvoider)]
        });
    }
    useEffect(
        function () {
            setSingAvoidList(getPlayerAvoidList(playerId, avoidList));
        },
        [avoidList, playerId]
    );
    useEffect(
        function () {
            setSelectedAvoider(unAvoided[0]);
        },
        [setSelectedAvoider, unAvoided]
    );
    return (
        <div>
            <Link to="/players"><ChevronLeft /> Back</Link>
            <h2>
                {getPlayer(playerId).firstName} {getPlayer(playerId).lastName}
            </h2>
            <dl>
                <dt id="match-count">Matches played</dt>
                <dd aria-labelledby="match-count">
                    {getPlayer(playerId).matchCount}
                </dd>
                <dt id="rating">Rating</dt>
                <dd aria-labelledby="rating">{getPlayer(playerId).rating}</dd>
                <dt>K factor</dt>
                <dd>
                    {numeral(kFactor(getPlayer(playerId).matchCount)).format(
                        "00"
                    )}
                </dd>
                <dt>Players to avoid</dt>
                <dd>
                    <ul>
                        {singAvoidList.map((pId) => (
                            <li key={pId}>
                                {getPlayer(pId).firstName}{" "}
                                {getPlayer(pId).lastName}{" "}
                                <button
                                    className="danger iconButton"
                                    onClick={() =>
                                        playerDispatch({
                                            type: "DEL_AVOID_PAIR",
                                            pair: [playerId, pId]
                                        })
                                    }
                                    title={`Remove ${getPlayer(pId).firstName}
${getPlayer(pId).lastName}`}
                                    arial-label={`Remove 
${getPlayer(pId).firstName} ${getPlayer(pId).lastName} from avoid list.`}
                                >
                                    <Trash />
                                </button>
                            </li>
                        ))}
                        {avoidList.length === 0 && <li>None</li>}
                    </ul>
                </dd>
            </dl>
            <form onSubmit={(event) => avoidAdd(event)}>
                <fieldset>
                    <legend>Add player to avoid</legend>
                    <select
                        onBlur={(event) =>
                            setSelectedAvoider(Number(event.target.value))
                        }
                    >
                        {unAvoided.map((pId) => (
                            <option key={pId} value={pId}>
                                {getPlayer(pId).firstName}{" "}
                                {getPlayer(pId).lastName}
                            </option>
                        ))}
                    </select>{" "}
                    <input type="submit" value="Add" />
                </fieldset>
            </form>
        </div>
    );
}
