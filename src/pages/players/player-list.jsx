import React, {useEffect, useState} from "react";
import {Dialog} from "@reach/dialog";
import Icons from "../../components/icons";
import {Link} from "@reach/router";
import NewPlayer from "../../components/new-player";
import PropTypes from "prop-types";
import {SortLabel} from "../../components/utility";
import VisuallyHidden from "@reach/visually-hidden";
import styles from "./index.module.css";
import {useWindowContext} from "../../components/window";

export default function PlayerList({
    sorted,
    sortDispatch,
    players,
    playersDispatch,
    optionsDispatch
}) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const {winDispatch} = useWindowContext();
    useEffect(
        function setDocumentTitle() {
            winDispatch({title: "Players"});
            return () => winDispatch({action: "RESET_TITLE"});
        },
        [winDispatch]
    );
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
        <div className="content-area">
            <div className="toolbar toolbar__left">
                <button onClick={() => setIsFormOpen(true)}>
                    <Icons.UserPlus /> Add a new player
                </button>
            </div>
            <table className={styles.table}>
                <caption>Player roster</caption>
                <thead>
                    <tr>
                        <th>
                            <SortLabel
                                data={sorted}
                                dispatch={sortDispatch}
                                sortKey="firstName"
                            >
                                Name
                            </SortLabel>
                        </th>
                        <th>
                            <SortLabel
                                data={sorted}
                                dispatch={sortDispatch}
                                sortKey="rating"
                            >
                                Rating
                            </SortLabel>
                        </th>
                        <th>
                            <SortLabel
                                data={sorted}
                                dispatch={sortDispatch}
                                sortKey="matchCount"
                            >
                                Matches
                            </SortLabel>
                        </th>
                        <th><VisuallyHidden>Controls</VisuallyHidden></th>
                    </tr>
                </thead>
                <tbody className="content">
                    {sorted.table.map((p) =>
                        <tr key={p.id}  className="buttons-on-hover">
                            <td className="table__player">
                                <Link to={p.id}>
                                    {p.firstName} {p.lastName}
                                </Link>
                            </td>
                            <td className="table__number">
                                {p.rating}
                            </td>
                            <td className="table__number">
                                {p.matchCount}
                            </td>
                            <td>
                                <button
                                    className="danger button-ghost"
                                    onClick={
                                        (event) => delPlayer(event, p.id)
                                    }
                                >
                                    <Icons.Trash />
                                    <VisuallyHidden>
                                        Delete {p.firstName} {p.lastName}
                                    </VisuallyHidden>
                                </button>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <Dialog isOpen={isFormOpen}>
                <button
                    className="button-micro"
                    onClick={() => setIsFormOpen(false)}
                >
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
    playersDispatch: PropTypes.func.isRequired,
    sortDispatch: PropTypes.func.isRequired,
    sorted: PropTypes.object.isRequired
};
