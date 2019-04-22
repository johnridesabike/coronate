import React, {useState} from "react";
import {getPlayer} from "../../chess-tourney/player";
import {tieBreakMethods, hasHadBye} from "../../chess-tourney/scores";
import {PanelContainer, Panel} from "../utility";
import arrayMove from "array-move";

export default function PlayerSelect({
    tourneyList,
    setTourneyList,
    tourneyId,
    playerList
}) {
    const players = tourneyList[tourneyId].players;
    const tourney = tourneyList[tourneyId];
    const [isSelecting, setIsSelecting] = useState((players.length === 0));
    const [selectedTb, setSelectedTb] = useState(null);
    function toggleTb(id = null) {
        if (!id) {
            id = selectedTb;
        }
        const tieBreaks = tourneyList[tourneyId].tieBreaks;
        if (tieBreaks.includes(id)) {
            tourneyList[tourneyId].tieBreaks = tieBreaks.filter(
                (id2) => id2 !== id
            );
        } else {
            tourneyList[tourneyId].tieBreaks = tieBreaks.concat([id]);
        }
        setTourneyList([...tourneyList]);
    }
    function moveTb(direction) {
        const tieBreaks = tourneyList[tourneyId].tieBreaks;
        const index = tieBreaks.indexOf(selectedTb);
        console.log(tieBreaks,index, direction);
        tourneyList[tourneyId].tieBreaks = arrayMove(
            tieBreaks,
            index,
            index + direction
        );
        setTourneyList([...tourneyList]);
    }
    function togglePlayer(event) {
        const id = Number(event.target.value);
        if (event.target.checked) {
            tourneyList[tourneyId].players = players.concat([id]);
        } else {
            tourneyList[tourneyId].players = players.filter(
                (pId) => pId !== id
            );
        }
        setTourneyList([...tourneyList]);
    }
    function selectAll() {
        tourneyList[tourneyId].players = playerList.map((p) => p.id);
        setTourneyList([...tourneyList]);
    }
    function selectNone() {
        tourneyList[tourneyId].players = [];
        setTourneyList([...tourneyList]);
    }
    function addByeQueue(id) {
        tourney.byeQueue = tourney.byeQueue.concat([id]);
        setTourneyList([...tourneyList]);
    }
    function removeByeQueue(id) {
        tourney.byeQueue = tourney.byeQueue.filter((pId) => pId !== id);
        setTourneyList([...tourneyList]);
    }
    if (isSelecting) {
        return (
            <table>
                <caption>Select players</caption>
                <thead>
                    <tr>
                        <th>First name</th>
                        <th>Last name</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                {playerList.map((p) =>
                    <tr key={p.id}>
                        <td>{p.firstName}</td>
                        <td>{p.lastName}</td>
                        <td>
                            <input
                                type="checkbox"
                                value={p.id}
                                checked={players.includes(p.id)}
                                onChange={togglePlayer} />
                        </td>
                    </tr>
                )}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={3}>
                            <button onClick={() => selectAll()}>
                                Select all
                            </button>
                            <button onClick={() => selectNone()}>
                                Select none
                            </button>
                            <button onClick={() => setIsSelecting(false)}>
                                Done
                            </button>
                        </td>
                    </tr>
                </tfoot>
            </table>
        );
    } else {
        return (
            <PanelContainer>
            <Panel>
            <table>
                <thead>
                    <tr>
                        <th>First name</th>
                        <th>Last name</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                {players.map((pId) =>
                    <tr
                        key={pId}
                        className={
                            getPlayer(pId, playerList).type + " player"
                        }>
                        <td>{getPlayer(pId, playerList).firstName}</td>
                        <td>{getPlayer(pId, playerList).lastName}</td>
                        <td>
                            <button
                                onClick={() => addByeQueue(pId)}
                                disabled={tourney.byeQueue.includes(pId)}>
                                Bye
                            </button>
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
            <button onClick={() => setIsSelecting(true)}>
                Edit player roster
            </button>
            <h3>Bye queue</h3>
            <ol>
            {tourney.byeQueue.map((pId) =>
                <li
                    key={pId}
                    className={(
                        (hasHadBye(pId, tourney.roundList))
                        ? "disabled"
                        : ""
                    )}>
                    {getPlayer(pId, playerList).firstName}&nbsp;
                    {getPlayer(pId, playerList).lastName}
                    <button
                        onClick={() => removeByeQueue(pId)}>
                        Remove
                    </button>
                </li>
            )}
            </ol>
            </Panel>
            <Panel>
                <h3>Selected tiebreak methods</h3>
                <div className="toolbar">
                    <button
                        onClick={() => toggleTb()}
                        disabled={selectedTb === null}>
                        Toggle
                    </button>
                    <button
                        onClick={() => moveTb(-1)}
                        disabled={selectedTb === null}>
                        Move up
                    </button>
                    <button
                        onClick={() => moveTb(1)}
                        disabled={selectedTb === null}>
                        Move down
                    </button>
                    <button
                        onClick={() => setSelectedTb(null)}
                        disabled={selectedTb === null}>
                        Done
                    </button>
                </div>
                <ol>
                {tourney.tieBreaks.map((id) =>
                    <li key={id}>
                        {tieBreakMethods[id].name}
                        <button
                            onClick={() => (
                                (selectedTb === id)
                                ? setSelectedTb(null)
                                : setSelectedTb(id)
                            )}
                            disabled={selectedTb !== null && selectedTb !== id}>
                            {selectedTb === id ? "Done" : "Edit"}
                        </button>
                    </li>
                )}
                </ol>
                <h3>Available tiebreak methods</h3>
                <ol>
                {tieBreakMethods.map((method, i) =>
                    <li key={i}>
                        <span
                            className={(
                                (tourney.tieBreaks.includes(i))
                                ? "enabled"
                                : "disabled"
                            )}>
                            {method.name}
                        </span>
                        {(!tourney.tieBreaks.includes(i)) &&
                            <button onClick={() => toggleTb(i)}>
                                Add
                            </button>
                        }
                    </li>
                )}
                </ol>
            </Panel>
            </PanelContainer>
        );
    }
}