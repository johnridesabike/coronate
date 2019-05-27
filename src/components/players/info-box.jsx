import React, {useEffect, useMemo, useState} from "react";
import {getPlayerAvoidList, kFactor} from "../../pairing-scoring";
import Icons from "../icons";
import {Link} from "@reach/router";
import PropTypes from "prop-types";
import numeral from "numeral";
import styles from "./index.module.css";

export default function PlayerInfoBox({
    playerId,
    players,
    playersDispatch,
    options,
    optionsDispatch
}) {
    const player = players[playerId];
    const [singAvoidList, setSingAvoidList] = useState(
        getPlayerAvoidList(playerId, options.avoidPairs)
    );
    // Memoize this so useEffect doesn't cause a memory leak.
    const unAvoided = useMemo(
        () => Object.keys(players).filter(
            (id) => !singAvoidList.includes(id) && id !== playerId
        ),
        [players, playerId, singAvoidList]
    );
    const [selectedAvoider, setSelectedAvoider] = useState(unAvoided[0]);
    function avoidAdd(event) {
        event.preventDefault();
        optionsDispatch({
            pair: [playerId, selectedAvoider],
            type: "ADD_AVOID_PAIR"
        });
    }
    useEffect(
        function () {
            setSingAvoidList(getPlayerAvoidList(playerId, options.avoidPairs));
        },
        [options.avoidPairs, playerId]
    );
    useEffect(
        function () {
            setSelectedAvoider(unAvoided[0]);
        },
        [setSelectedAvoider, unAvoided]
    );
    useEffect(
        function () {
            if (!player) {
                return;
            }
            const origTitle = document.title;
            document.title = (
                player.firstName
                + " " + player.lastName
            );
            return function () {
                document.title = origTitle;
            };
        },
        [playerId, player]
    );
    function handleChange(event) {
        event.preventDefault();
        const {firstName, lastName, matchCount, rating} = event.currentTarget;
        playersDispatch({
            firstName: firstName.value,
            id: playerId,
            lastName: lastName.value,
            matchCount: Number(matchCount.value),
            rating: Number(rating.value),
            type: "SET_PLAYER"
        });
    }
    if (!player) {
        return <div>Loading...</div>;
    }
    return (
        <div className={styles.playerInfo}>
            <Link to=".."><Icons.ChevronLeft /> Back</Link>
            <h2>
                Profile for {player.firstName} {player.lastName}
            </h2>
            <form onChange={handleChange} onSubmit={handleChange}>
                <p>
                    <label>
                    First name{" "}
                        <input
                            defaultValue={player.firstName}
                            name="firstName"
                            type="text"
                        />
                    </label>
                </p>
                <p>
                    <label>
                    Last name{" "}
                        <input
                            defaultValue={player.lastName}
                            name="lastName"
                            type="text"
                        />
                    </label>
                </p>
                <p>
                    <label>
                    Matches played{" "}
                        <input
                            defaultValue={String(player.matchCount)}
                            name="matchCount"
                            type="number"
                        />
                    </label>
                </p>
                <p>
                    <label>
                    Rating
                        <input
                            defaultValue={String(player.rating)}
                            name="rating"
                            type="number"
                        />
                    </label>
                </p>
                <p>
                    <label>
                    K factor
                        <input
                            type="number"
                            value={(
                                numeral(
                                    kFactor(player.matchCount)
                                ).format("00")
                            )}
                            readOnly
                        />
                    </label>
                </p>
            </form>
            <h3>Players to avoid</h3>
            <ul>
                {singAvoidList.map((pId) =>
                    <li key={pId}>
                        {players[pId].firstName} {players[pId].lastName}
                        <button
                            arial-label={`Remove 
${players[pId].firstName} ${players[pId].lastName} from avoid list.`}
                            className="danger iconButton"
                            title={`Remove ${players[pId].firstName} 
${players[pId].lastName}`}
                            onClick={() =>
                                optionsDispatch({
                                    pair: [playerId, pId],
                                    type: "DEL_AVOID_PAIR"
                                })
                            }
                        >
                            <Icons.Trash />
                        </button>
                    </li>
                )}
                {singAvoidList.length === 0 &&
                    <li>None</li>
                }
            </ul>
            <form onSubmit={avoidAdd}>
                <fieldset>
                    <legend>Add player to avoid</legend>
                    <select
                        onBlur={(event) =>
                            setSelectedAvoider(event.target.value)
                        }
                    >
                        {unAvoided.map((pId) => (
                            <option key={pId} value={pId}>
                                {players[pId].firstName} {players[pId].lastName}
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
    options: PropTypes.object.isRequired,
    optionsDispatch: PropTypes.func.isRequired,
    playerId: PropTypes.string.isRequired,
    players: PropTypes.object.isRequired,
    playersDispatch: PropTypes.object.isRequired
};
