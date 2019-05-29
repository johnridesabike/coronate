import {Panel, PanelContainer} from "../../utility";
import React, {useState} from "react";
import {hasHadBye, rounds2Matches} from "../../../pairing-scoring";
import {Dialog} from "@reach/dialog";
import Icons from "../../icons";
import Selecting from "./selecting";
import {useTournament} from "../../../hooks";

export default function PlayerSelect(props) {
    const {tourney, tourneyDispatch, players} = useTournament();
    const {playerIds, roundList, byeQueue} = tourney;
    const dispatch = tourneyDispatch;
    const [isSelecting, setIsSelecting] = useState(playerIds.length === 0);
    const matches = rounds2Matches(roundList);
    return (
        <div className="content-area">
            <div className="toolbar">
                <button onClick={() => setIsSelecting(true)}>
                    <Icons.Edit /> Edit player roster
                </button>
            </div>
            <PanelContainer>
                <Panel style={{flexShrink: "0"}}>
                    <table>
                        <caption>Current roster</caption>
                        <thead>
                            <tr>
                                <th colSpan={2}>Name</th>
                                <th>Options</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.values(players).map((p) => (
                                <tr key={p.id} className={p.type + " player"}>
                                    <td>{p.firstName}</td>
                                    <td>{p.lastName}</td>
                                    <td>
                                        <button
                                            className="button-micro"
                                            disabled={byeQueue.includes(p.id)}
                                            onClick={() =>
                                                dispatch({
                                                    byeQueue:
                                                        byeQueue.concat([p.id]),
                                                    type: "SET_BYE_QUEUE"
                                                })
                                            }
                                        >
                                            Bye signup
                                        </button>
                                    </td>
                                </tr>
                            )
                            )}
                        </tbody>
                    </table>
                </Panel>
                <Panel>
                    <h3>Bye queue</h3>
                    {byeQueue.length === 0 &&
                        <p>No players have signed up for a bye round.</p>
                    }
                    <ol>
                        {byeQueue.map((pId) => (
                            <li
                                key={pId}
                                className={
                                    (hasHadBye(pId, matches))
                                    ? "disabled buttons-on-hover"
                                    : "buttons-on-hover"
                                }
                            >
                                {players[pId].firstName}{" "}
                                {players[pId].lastName}{" "}
                                <button
                                    className="button-micro"
                                    onClick={() =>
                                        dispatch({
                                            byeQueue: byeQueue.filter(
                                                (id) => pId !== id
                                            ),
                                            type: "SET_BYE_QUEUE"
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
                    <button
                        className="button-micro button-primary"
                        onClick={() => setIsSelecting(false)}
                    >
                        Done
                    </button>
                    <Selecting />
                </Dialog>
            </PanelContainer>
        </div>
    );
}
PlayerSelect.propTypes = {};
