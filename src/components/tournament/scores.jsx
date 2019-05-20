import React, {useState} from "react";
import numeral from "numeral";
import dashify from "dashify";
import {defaultTo} from "ramda";
import PropTypes from "prop-types";
import Icons from "../icons";
import {Tab, Tabs, TabList, TabPanel, TabPanels} from "@reach/tabs";
import {useTournament, usePlayers} from "../../state";
import {
    createStandingTree,
    tieBreakMethods
} from "../../pairing-scoring/scoring";
import style from "./scores.module.css";

function ScoreTable({tourneyId}) {
    const [{tieBreaks, roundList}] = useTournament(tourneyId);
    const {getPlayer} = usePlayers();
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
                                    scope="row"
                                    className={"table__number " + style.rank}
                                    rowSpan={src.length}
                                >
                                    {numeral(rank + 1).format("0o")}
                                </th>
                            )}
                            <th
                                scope="row"
                                className={style.playerName}
                                data-testid={rank}
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
ScoreTable.propTypes = {
    tourneyId: PropTypes.number.isRequired
};

function SelectTieBreaks({tourneyId}) {
    const [{tieBreaks}, dispatch] = useTournament(tourneyId);
    const [selectedTb, setSelectedTb] = useState(null);

    function toggleTb(id = null) {
        const defaultId = defaultTo(selectedTb);
        if (tieBreaks.includes(defaultId(id))) {
            dispatch({type: "DEL_TIEBREAK", id: defaultId(id), tourneyId});
            setSelectedTb(null);
        } else {
            dispatch({type: "ADD_TIEBREAK", id: defaultId(id), tourneyId});
        }
    }

    function moveTb(direction) {
        const index = tieBreaks.indexOf(selectedTb);
        dispatch({
            type: "MOVE_TIEBREAK",
            oldIndex: index,
            newIndex: index + direction,
            tourneyId
        });
    }

    return (
        <div>
            <h3>Selected tiebreak methods</h3>
            <div className="toolbar">
                <button
                    onClick={() => toggleTb()}
                    disabled={selectedTb === null}
                >
                    Toggle
                </button>
                <button
                    onClick={() => moveTb(-1)}
                    disabled={selectedTb === null}
                >
                    <Icons.ArrowUp/> Move up
                </button>
                <button
                    onClick={() => moveTb(1)}
                    disabled={selectedTb === null}
                >
                    <Icons.ArrowDown/> Move down
                </button>
                <button
                    onClick={() => setSelectedTb(null)}
                    disabled={selectedTb === null}
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
                            onClick={() =>
                                selectedTb === id
                                    ? setSelectedTb(null)
                                    : setSelectedTb(id)
                            }
                            disabled={
                                selectedTb !== null && selectedTb !== id
                            }
                        >
                            {selectedTb === id ? "Done" : "Edit"}
                        </button>
                    </li>
                ))}
            </ol>
            <h3>Available tiebreak methods</h3>
            <ol>
                {tieBreakMethods.map((method, id) => (
                    <li key={id}>
                        <span
                            className={
                                tieBreaks.includes(id)
                                    ? "enabled"
                                    : "disabled"
                            }
                        >
                            {method.name}
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
SelectTieBreaks.propTypes = {
    tourneyId: PropTypes.number.isRequired
};

const Scores = ({tourneyId}) => (
    <Tabs>
        <TabList>
            <Tab><Icons.List /> Scores</Tab>
            <Tab><Icons.Settings /> Edit tiebreak rules</Tab>
        </TabList>
        <TabPanels>
            <TabPanel>
                <ScoreTable tourneyId={Number(tourneyId)}/>
            </TabPanel>
            <TabPanel>
                <SelectTieBreaks tourneyId={Number(tourneyId)} />
            </TabPanel>
        </TabPanels>
    </Tabs>
);
Scores.propTypes = {
    tourneyId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    path: PropTypes.string
};

export default Scores;
