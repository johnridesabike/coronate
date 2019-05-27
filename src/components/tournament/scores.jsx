import React, {useState} from "react";
import {Tab, TabList, TabPanel, TabPanels, Tabs} from "@reach/tabs";
import {
    createStandingTree,
    tieBreakMethods
} from "../../pairing-scoring";
import Icons from "../icons";
import PropTypes from "prop-types";
import dashify from "dashify";
import {defaultTo} from "ramda";
import numeral from "numeral";
import style from "./scores.module.css";
import {useTournament} from "../../hooks";

function ScoreTable(props) {
    const {tourney, getPlayer} = useTournament();
    const {tieBreaks, roundList} = tourney;
    const [standingTree, tbMethods] = createStandingTree(tieBreaks, roundList);
    return (
        <table className={style.table}>
            <caption>Score detail</caption>
            <tbody>
                <tr className={style.topHeader}>
                    <th scope="col">Rank</th>
                    <th scope="col">Name</th>
                    <th scope="col">Score</th>
                    {tbMethods.map((name, i) => (
                        <th key={i} scope="col">
                            {name}
                        </th>
                    ))}
                </tr>
                {standingTree.map((standingsFlat, rank) =>
                    standingsFlat.map((standing, j, src) => (
                        <tr key={standing.id} className={style.row}>
                            {j === 0 && ( // Only display the rank once
                                <th
                                    className={"table__number " + style.rank}
                                    rowSpan={src.length}
                                    scope="row"
                                >
                                    {numeral(rank + 1).format("0o")}
                                </th>
                            )}
                            <th
                                className={style.playerName}
                                data-testid={rank}
                                scope="row"
                            >
                                {getPlayer(standing.id).firstName}&nbsp;
                                {getPlayer(standing.id).lastName}
                            </th>
                            <td
                                className="table__number"
                                data-testid={dashify(
                                    getPlayer(standing.id).firstName
                                    + getPlayer(standing.id).lastName
                                    + " score"
                                )}
                            >
                                {numeral(standing.score).format("1/2")}
                            </td>
                            {standing.tieBreaks.map((score, i) => (
                                <td
                                    key={i}
                                    className="table__number"
                                    data-testid={dashify(
                                        getPlayer(standing.id).firstName
                                        + getPlayer(standing.id).lastName
                                        + tbMethods[i]
                                    )}
                                >
                                    {numeral(score).format("1/2")}
                                </td>
                            ))}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
}
ScoreTable.propTypes = {};

function SelectTieBreaks(props) {
    const {tourney, tourneyDispatch} = useTournament();
    const dispatch = tourneyDispatch;
    const {tieBreaks} = tourney;
    const [selectedTb, setSelectedTb] = useState(null);

    function toggleTb(id = null) {
        const defaultId = defaultTo(selectedTb);
        if (tieBreaks.includes(defaultId(id))) {
            dispatch({id: defaultId(id), type: "DEL_TIEBREAK"});
            setSelectedTb(null);
        } else {
            dispatch({id: defaultId(id), type: "ADD_TIEBREAK"});
        }
    }

    function moveTb(direction) {
        const index = tieBreaks.indexOf(selectedTb);
        dispatch({
            newIndex: index + direction,
            oldIndex: index,
            type: "MOVE_TIEBREAK"
        });
    }

    return (
        <div>
            <h3>Selected tiebreak methods</h3>
            <div className="toolbar">
                <button
                    disabled={selectedTb === null}
                    onClick={() => toggleTb()}
                >
                    Toggle
                </button>
                <button
                    disabled={selectedTb === null}
                    onClick={() => moveTb(-1)}
                >
                    <Icons.ArrowUp/> Move up
                </button>
                <button
                    disabled={selectedTb === null}
                    onClick={() => moveTb(1)}
                >
                    <Icons.ArrowDown/> Move down
                </button>
                <button
                    disabled={selectedTb === null}
                    onClick={() => setSelectedTb(null)}
                >
                    Done
                </button>
            </div>
            <ol>
                {tieBreaks.map((id) => (
                    <li
                        key={id}
                        className={selectedTb === id ? "selected" : ""}
                    >
                        {tieBreakMethods[id].name}{" "}
                        <button
                            disabled={
                                selectedTb !== null && selectedTb !== id
                            }
                            onClick={() =>
                                selectedTb === id
                                    ? setSelectedTb(null)
                                    : setSelectedTb(id)
                            }
                        >
                            {selectedTb === id ? "Done" : "Edit"}
                        </button>
                    </li>
                ))}
            </ol>
            <h3>Available tiebreak methods</h3>
            <ol>
                {Object.values(tieBreakMethods).map(({name, id}) => (
                    <li key={id}>
                        <span
                            className={
                                tieBreaks.includes(id)
                                    ? "enabled"
                                    : "disabled"
                            }
                        >
                            {name}
                        </span>
                        {!tieBreaks.includes(id) && (
                            <button onClick={() => toggleTb(id)}>
                                Add
                            </button>
                        )}
                    </li>
                ))}
            </ol>
        </div>
    );
}
SelectTieBreaks.propTypes = {};

const Scores = (props) => (
    <Tabs>
        <TabList>
            <Tab><Icons.List /> Scores</Tab>
            <Tab><Icons.Settings /> Edit tiebreak rules</Tab>
        </TabList>
        <TabPanels>
            <TabPanel>
                <ScoreTable />
            </TabPanel>
            <TabPanel>
                <SelectTieBreaks />
            </TabPanel>
        </TabPanels>
    </Tabs>
);
Scores.propTypes = {
    path: PropTypes.string
};

export default Scores;
