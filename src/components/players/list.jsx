import React, {Fragment, useState} from "react";
import {Link} from "@reach/router";
import VisuallyHidden from "@reach/visually-hidden";
import ChevronRight from "react-feather/dist/icons/chevron-right";
import Trash from "react-feather/dist/icons/trash-2";
import {createPlayer} from "../../data/player";
import {usePlayers} from "../../state";
import {PlayerLink} from "../utility";

/**
 * @param {Object} props
 */
export default function PlayerList(props) {
    const [playerState, playerDispatch] = usePlayers();
    const newPlayerDefault = {firstName: "", lastName: "", rating: 1200};
    const [newPlayerData, setNewPlayerdata] = useState(newPlayerDefault);
    const ids = playerState.players.map((p) => p.id);
    ids.sort((a, b) => a - b);
    ids.reverse();
    const [nextId, setNextId] = useState(ids[0] + 1);
    /** @param {React.FormEvent<HTMLFormElement>} event */
    const handleSubmit = function (event) {
        event.preventDefault();
        const newPlayer = createPlayer(newPlayerData);
        newPlayer.id = nextId;
        setNextId((prevId) => prevId + 1);
        setNewPlayerdata(newPlayerDefault);
        playerDispatch({type: "ADD_PLAYER", newPlayer});
    };
    /** @param {React.ChangeEvent<HTMLInputElement>} event */
    const updateField = function (event) {
        event.preventDefault();
        /** @type {Object<string, string>} */
        let update = {};
        update[event.currentTarget.name] = event.currentTarget.value;
        setNewPlayerdata(Object.assign({}, newPlayerData, update));
    };
    /**
     * @param {React.MouseEvent<HTMLButtonElement, MouseEvent>} event
     * @param {number} id
     */
    const delPlayer = function (event, id) {
        event.preventDefault();
        playerDispatch({type: "DEL_PLAYER", id});
    };
    let rosterTable = <Fragment></Fragment>;
    if (playerState.players.length > 0) {
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
            <tbody>{playerState.players.map((player) =>
                <tr key={player.id}>
                    <td className="table__player">
                        <PlayerLink id={player.id} firstName />
                    </td>
                    <td className="table__player">
                        <PlayerLink id={player.id} lastName />
                    </td>
                    <td className="table__number">{player.rating}</td>
                    <td>
                        <button
                            className="danger iconButton"
                            onClick={(event) =>
                                delPlayer(event, player.id)
                            }
                            // eslint-disable-next-line max-len
                            title={`Delete ${player.firstName} ${player.lastName}`}
                            // eslint-disable-next-line max-len
                            aria-label={`Delete ${player.firstName} ${player.lastName}`}
                        >
                            <Trash />
                        </button>
                    </td>
                    <td>
                        <Link to={String(player.id)}>
                            Open
                            <VisuallyHidden>
                                {" "}{player.firstName} {player.lastName}
                            </VisuallyHidden>
                            {" "}<ChevronRight />
                        </Link>
                    </td>
                </tr>
            )}</tbody>
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
                            First name
                            {" "}
                            <input type="text" name="firstName"
                                onChange={updateField}
                                value={newPlayerData.firstName} required />
                        </label>
                    </p>
                    <p>
                        <label>
                            Last name
                            {" "}
                            <input type="text" name="lastName"
                                onChange={updateField}
                                value={newPlayerData.lastName} required />
                        </label>
                    </p>
                    <p>
                        <label>
                            Rating
                            {" "}
                            <input
                                type="number"
                                name="rating"
                                onChange={updateField}
                                value={newPlayerData.rating}
                                required />
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
