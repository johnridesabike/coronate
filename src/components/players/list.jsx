import React from "react";
import {Link} from "@reach/router";
import VisuallyHidden from "@reach/visually-hidden";
import Icons from "../icons";
import {usePlayers} from "../../state";
import {PlayerLink} from "../utility";
import NewPlayer from "./new-player";

export default function PlayerList(props) {
    const {playerState, playerDispatch} = usePlayers();
    const delPlayer = function (event, id) {
        event.preventDefault();
        playerDispatch({type: "DEL_PLAYER", id});
    };
    return (
        <div>
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
                                <Icons.Trash />
                            </button>
                        </td>
                        <td>
                            <Link to={String(player.id)}>
                            Open
                                <VisuallyHidden>
                                    {" "}{player.firstName} {player.lastName}
                                </VisuallyHidden>
                                {" "}<Icons.ChevronRight />
                            </Link>
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
            <NewPlayer />
        </div>
    );
}
