import React, {useEffect, useMemo, useState} from "react";
import {getPlayerAvoidList, kFactor} from "../../pairing-scoring";
import Icons from "../icons";
import {Link} from "@reach/router";
import PropTypes from "prop-types";
import numeral from "numeral";
import {usePlayers} from "../../state";

export default function PlayerInfoBox(props) {
    const playerId = Number(props.playerId);
    const {playerState, playerDispatch, getPlayer} = usePlayers();
    const {players, avoid} = playerState;
    const [singAvoidList, setSingAvoidList] = useState(
        getPlayerAvoidList(playerId, avoid)
    );
    const unAvoided = useMemo(
        () => (
            players.map(
                (player) => player.id
            ).filter(
                (pId) => !singAvoidList.includes(pId) && pId !== playerId
            )
        ),
        [players, playerId, singAvoidList]
    );
    const [selectedAvoider, setSelectedAvoider] = useState(unAvoided[0]);
    function avoidAdd(event) {
        event.preventDefault();
        playerDispatch({
            pair: [playerId, Number(selectedAvoider)],
            type: "ADD_AVOID_PAIR"
        });
    }
    useEffect(
        function () {
            setSingAvoidList(getPlayerAvoidList(playerId, avoid));
        },
        [avoid, playerId]
    );
    useEffect(
        function () {
            setSelectedAvoider(unAvoided[0]);
        },
        [setSelectedAvoider, unAvoided]
    );
    useEffect(
        function () {
            const origTitle = document.title;
            document.title = (
                getPlayer(playerId).firstName
                + " " + getPlayer(playerId).lastName
            );
            return function () {
                document.title = origTitle;
            };
        },
        [playerId, getPlayer]
    );
    function handleChange(event) {
        event.preventDefault();
        const {firstName, lastName, matchCount, rating} = event.currentTarget;
        playerDispatch({
            firstName: firstName.value,
            id: playerId,
            lastName: lastName.value,
            matchCount: Number(matchCount.value),
            rating: Number(rating.value),
            type: "SET_PLAYER"
        });
    }
    return (
        <div>
            <Link to=".."><Icons.ChevronLeft /> Back</Link>
            <h2>
                Profile for{" "}
                {getPlayer(playerId).firstName} {getPlayer(playerId).lastName}
            </h2>
            <form onChange={handleChange} onSubmit={handleChange}>
                <p>
                    <label>
                    First name{" "}
                        <input
                            type="text"
                            name="firstName"
                            defaultValue={getPlayer(playerId).firstName}
                        />
                    </label>
                </p>
                <p>
                    <label>
                    Last name{" "}
                        <input
                            type="text"
                            name="lastName"
                            defaultValue={getPlayer(playerId).lastName}
                        />
                    </label>
                </p>
                <p>
                    <label>
                    Matches played{" "}
                        <input
                            type="number"
                            name="matchCount"
                            defaultValue={
                                String(getPlayer(playerId).matchCount)
                            }
                        />
                    </label>
                </p>
                <p>
                    <label>
                    Rating
                        <input
                            type="number"
                            name="rating"
                            defaultValue={String(getPlayer(playerId).rating)}
                        />
                    </label>
                </p>
                <p>
                    <label>
                    K factor
                        <input
                            type="number"
                            readOnly
                            value={(
                                numeral(
                                    kFactor(getPlayer(playerId).matchCount)
                                ).format("00")
                            )}
                        />
                    </label>
                </p>
            </form>
            <ul>
                <h3>Players to avoid</h3>
                {singAvoidList.map((pId) => (
                    <li key={pId}>
                        {getPlayer(pId).firstName}{" "}
                        {getPlayer(pId).lastName}{" "}
                        <button
                            className="danger iconButton"
                            onClick={() =>
                                playerDispatch({
                                    pair: [playerId, pId],
                                    type: "DEL_AVOID_PAIR"
                                })
                            }
                            title={`Remove ${getPlayer(pId).firstName} 
${getPlayer(pId).lastName}`}
                            arial-label={`Remove 
${getPlayer(pId).firstName} ${getPlayer(pId).lastName} from avoid list.`}
                        >
                            <Icons.Trash />
                        </button>
                    </li>
                ))}
                {avoid.length === 0 && <li>None</li>}
            </ul>
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
PlayerInfoBox.propTypes = {
    path: PropTypes.string,
    playerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};
