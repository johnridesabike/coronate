import React, {useState} from "react";
import PropTypes from "prop-types";
import {Dialog} from "@reach/dialog";
import Icons from "../../icons";
import Selecting from "./selecting";
import {useTournament, usePlayers} from "../../../state";
import {PanelContainer, Panel} from "../../utility";
import {hasHadBye} from "../../../pairing-scoring/scoring";

export default function PlayerSelect({tourneyId}) {
    // eslint-disable-next-line fp/no-mutation
    tourneyId = Number(tourneyId);
    const [{players, byeQueue, roundList}, dispatch] = useTournament(tourneyId);
    const {getPlayer} = usePlayers();
    const [isSelecting, setIsSelecting] = useState(players.length === 0);
    return (
        <PanelContainer>
            <Panel>
                <button onClick={() => setIsSelecting(true)}>
                    <Icons.Edit /> Edit player roster
                </button>
                <table>
                    <caption>Current roster</caption>
                    <thead>
                        <tr>
                            <th>First name</th>
                            <th>Last name</th>
                            <th>Options</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map((pId) => (
                            <tr
                                key={pId}
                                className={getPlayer(pId).type + " player"}
                            >
                                <td>{getPlayer(pId).firstName}</td>
                                <td>{getPlayer(pId).lastName}</td>
                                <td>
                                    <button
                                        onClick={() =>
                                            dispatch({
                                                type: "SET_BYE_QUEUE",
                                                byeQueue: byeQueue.concat(
                                                    [pId]
                                                ),
                                                tourneyId
                                            })
                                        }
                                        disabled={byeQueue.includes(
                                            pId
                                        )}
                                    >
                                        Bye signup
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Panel>
            <Panel>
                <h3>Bye queue</h3>
                {(byeQueue.length === 0) &&
                    <p>No players have signed up for a bye round.</p>
                }
                <ol>
                    {byeQueue.map((pId) => (
                        <li
                            key={pId}
                            className={
                                hasHadBye(pId, roundList)
                                    ? "disabled"
                                    : ""
                            }
                        >
                            {getPlayer(pId).firstName}{" "}
                            {getPlayer(pId).lastName}
                            <button
                                onClick={() =>
                                    dispatch({
                                        type: "SET_BYE_QUEUE",
                                        byeQueue: byeQueue.filter(
                                            (id) => pId !== id
                                        ),
                                        tourneyId
                                    })
                                }
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ol>
            </Panel>
            <Dialog isOpen={isSelecting}>
                <button onClick={() => setIsSelecting(false)}>Done</button>
                <Selecting tourneyId={tourneyId} />
            </Dialog>
        </PanelContainer>
    );
}
PlayerSelect.propTypes = {
    path: PropTypes.string,
    tourneyId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};
