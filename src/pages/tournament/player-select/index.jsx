import {DUMMY_ID, rounds2Matches, types} from "../../../data-types";
import {Panel, PanelContainer} from "../../../components/utility";
import React, {useState} from "react";
import {Dialog} from "@reach/dialog";
import Icons from "../../../components/icons";
import PropTypes from "prop-types";
import Selecting from "./selecting";
import t from "tcomb";
import {useTournament} from "../../../hooks";

function hasHadBye(matchList, playerId) {
    return t.list(types.Match)(matchList).filter(
        (match) => match.playerIds.includes(playerId)
    ).reduce(
        (acc, match) => acc.concat(match.playerIds),
        []
    ).includes(DUMMY_ID);
}

function PlayerList({players, dispatch, byeQueue}) {
    return (
        <>
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
        </>
    );
}
PlayerList.propTypes = {
    byeQueue: PropTypes.arrayOf(PropTypes.string).isRequired,
    dispatch: PropTypes.func.isRequired,
    players: PropTypes.object.isRequired
};

export default function PlayerSelect(props) {
    const {tourney, tourneyDispatch, activePlayers} = useTournament();
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
                        <tbody className="content">
                            <PlayerList
                                byeQueue={byeQueue}
                                dispatch={dispatch}
                                players={activePlayers}
                            />
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
                                    (hasHadBye(matches, pId))
                                    ? "disabled buttons-on-hover"
                                    : "buttons-on-hover"
                                }
                            >
                                {activePlayers[pId].firstName}{" "}
                                {activePlayers[pId].lastName}{" "}
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
