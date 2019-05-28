import React, {useEffect, useMemo, useState} from "react";
import {getPlayerAvoidList, kFactor} from "../../pairing-scoring";
import Icons from "../icons";
import {Link} from "@reach/router";
import PropTypes from "prop-types";
import numeral from "numeral";
import styles from "./index.module.css";
import {useDocumentTitle} from "../../hooks";

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
    const playerName = (player) ? player.firstName + " " + player.lastName : "";
    useDocumentTitle("profile for " + playerName);
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
                    <label htmlFor="firstName">First name</label>
                    <input
                        defaultValue={player.firstName}
                        name="firstName"
                        type="text"
                    />
                </p>
                <p>
                    <label htmlFor="lastName">Last name</label>
                    <input
                        defaultValue={player.lastName}
                        name="lastName"
                        type="text"
                    />
                </p>
                <p>
                    <label htmlFor="matchCount">Matches played</label>
                    <input
                        defaultValue={String(player.matchCount)}
                        name="matchCount"
                        type="number"
                    />
                </p>
                <p>
                    <label htmlFor="rating">Rating</label>
                    <input
                        defaultValue={String(player.rating)}
                        name="rating"
                        type="number"
                    />
                </p>
                <p>
                    <label htmlFor="Kfactor">K factor</label>
                    <input
                        name="kfactor"
                        type="number"
                        value={numeral(kFactor(player.matchCount)).format("00")}
                        readOnly
                    />
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
                            className="danger ghost"
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
    playerId: PropTypes.string,
    players: PropTypes.object.isRequired,
    playersDispatch: PropTypes.func.isRequired
};
