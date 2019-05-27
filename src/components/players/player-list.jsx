import React, {useState} from "react";
import {Dialog} from "@reach/dialog";
import Icons from "../icons";
import {Link} from "@reach/router";
import NewPlayer from "../new-player";
import PropTypes from "prop-types";
import VisuallyHidden from "@reach/visually-hidden";
import styles from "./index.module.css";

export default function PlayerList({
    players,
    playersDispatch,
    optionsDispatch
}) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const delPlayer = function (event, id) {
        event.preventDefault();
        const message = "Are you sure you want to delete "
            + players[id].firstName + " " + players[id].lastName + "?";
        if (window.confirm(message)) {
            playersDispatch({id, type: "DEL_ITEM"});
            optionsDispatch({id, type: "DEL_AVOID_SINGLE"});
        }
    };
    return (
        <div>
            <button onClick={() => setIsFormOpen(true)}>
                <Icons.UserPlus /> Add a new player
            </button>
            <table className={styles.table}>
                <caption>Player roster</caption>
                <thead>
                    <tr>
                        <th colSpan={2}>Name</th>
                        <th>Rating</th>
                        <th>Matches</th>
                        <th>Controls</th>
                    </tr>
                </thead>
                <tbody>{Object.values(players).map((player) =>
                    <tr key={player.id}>
                        <td className="table__player">
                            {player.firstName}
                        </td>
                        <td className="table__player">
                            {player.lastName}
                        </td>
                        <td className="table__number">{player.rating}</td>
                        <td className="table__number">{player.matchCount}</td>
                        <td className={styles.controls}>
                            <button
                                // eslint-disable-next-line max-len
                                aria-label={`Delete ${player.firstName} ${player.lastName}`}
                                className="danger iconButton"
                                // eslint-disable-next-line max-len
                                title={`Delete ${player.firstName} ${player.lastName}`}
                                onClick={(event) => delPlayer(event, player.id)}
                            >
                                <Icons.Trash />
                            </button>{" "}
                            <Link to={String(player.id)}>
                            Open
                                <VisuallyHidden>
                                    {" "}{player.firstName} {player.lastName}
                                </VisuallyHidden>{" "}
                                <Icons.ChevronRight />
                            </Link>
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
            <Dialog isOpen={isFormOpen}>
                <button onClick={() => setIsFormOpen(false)}>
                    Close
                </button>
                <NewPlayer dispatch={playersDispatch} />
            </Dialog>
        </div>
    );
}
PlayerList.propTypes = {
    optionsDispatch: PropTypes.func.isRequired,
    players: PropTypes.object.isRequired,
    playersDispatch: PropTypes.object.isRequired
};
