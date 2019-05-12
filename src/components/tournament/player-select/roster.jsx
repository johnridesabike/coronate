import React from "react";
import curry from "ramda/src/curry";
import {PanelContainer, Panel} from "../../utility";
import {getPlayerById} from "../../../data/player";
import {hasHadBye} from "../../../pairing-scoring/scoring";
import {useTournament} from "../../../state/tourneys-state";
import {usePlayers} from "../../../state/player-state";

/**
 * @param {Object} props
 */
export default function Roster({tourneyId, setIsSelecting}) {
    const [{players, byeQueue, roundList}, dispatch] = useTournament(tourneyId);
    const {playerState} = usePlayers();
    const getPlayer = curry(getPlayerById)(playerState.players);
    return (
        <PanelContainer>
            <Panel>
                <button onClick={() => setIsSelecting(true)}>
                    Edit player roster
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
        </PanelContainer>
    );
}
