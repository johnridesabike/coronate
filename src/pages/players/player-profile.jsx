import React, {useEffect, useState} from "react";
import Icons from "../../components/icons";
import {Link} from "@reach/router";
import PropTypes from "prop-types";
import {avoidPairReducer} from "../../Converters.bs";
import numeral from "numeral";
import {getKFactor} from "../../Scoring.bs";
import styles from "./index.module.css";
import {useWindowContext} from "../../components/window";

function PlayerProfile({
    playerId,
    players,
    playersDispatch,
    options,
    optionsDispatch
}) {
    const player = players[playerId];
    const playerName = (player) ? player.firstName + " " + player.lastName : "";
    const {winDispatch} = useWindowContext();
    useEffect(
        function setDocumentTitle() {
            winDispatch({title: "Profile for " + playerName});
            return () => winDispatch({title: ""});
        },
        [winDispatch, playerName]
    );
    const avoidObj = options.avoidPairs.reduce(avoidPairReducer, {});
    const singAvoidList = (avoidObj[playerId]) ? avoidObj[playerId] : [];
    const unAvoided = Object.keys(players).filter(
        (id) => !singAvoidList.includes(id) && id !== playerId
    );
    const [selectedAvoider, setSelectedAvoider] = useState(unAvoided[0]);
    function avoidAdd(event) {
        event.preventDefault();
        optionsDispatch({
            pair: [playerId, selectedAvoider],
            type: "ADD_AVOID_PAIR"
        });
        // Reset the selected avoider to the first on the list, but check to
        // make sure they weren't they weren't the first.
        const newSelected = (
            unAvoided[0] !== selectedAvoider
            ? unAvoided[0]
            : unAvoided[1]
        );
        setSelectedAvoider(newSelected);
    }
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
    function handleAvoidChange(event) {
        setSelectedAvoider(event.target.value);
    }
    if (!player) {
        return <div>Loading...</div>;
    }
    return (
        <div className={styles.playerInfo + " content-area"}>
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
                        disabled
                        value={
                            numeral(
                                getKFactor(player.matchCount)
                            ).format("00")
                        }
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
                            className="danger button-ghost"
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
                <label htmlFor="avoid-select">
                    Select a new player to avoid.
                </label>
                <select
                    id="avoid-select"
                    onBlur={handleAvoidChange}
                    onChange={handleAvoidChange}
                    value={selectedAvoider}
                >
                    {unAvoided.map((pId) => (
                        <option key={pId} value={pId}>
                            {players[pId].firstName} {players[pId].lastName}
                        </option>
                    ))}
                </select>{" "}
                <input className="button-micro" type="submit" value="Add" />
            </form>
        </div>
    );
}
PlayerProfile.propTypes = {
    options: PropTypes.object.isRequired,
    optionsDispatch: PropTypes.func.isRequired,
    playerId: PropTypes.string,
    players: PropTypes.object.isRequired,
    playersDispatch: PropTypes.func.isRequired
};

export default function PlayerProfileWrapper(props) {
    if (!props.players[props.playerId]) {
        return <div>Error: player profile not found.</div>;
    } else {
        return <PlayerProfile {...props} />;
    }
}
PlayerProfileWrapper.propTypes = {
    playerId: PropTypes.string,
    players: PropTypes.object.isRequired
};
