import {Panel, PanelContainer} from "../../components/utility";
import React, {useState} from "react";
import {Tab, TabList, TabPanel, TabPanels, Tabs} from "@reach/tabs";
import {matches2ScoreData} from "../../Converters.bs";
import {
    createStandingList,
    createStandingTree,
    getTieBreakNames,
    tieBreakMethods
} from "../../Scoring.bs";
import {pipe} from "ramda";
import {isDummyObj, rounds2Matches} from "../../data-types";
import Icons from "../../components/icons";
import PropTypes from "prop-types";
import VisuallyHidden from "@reach/visually-hidden";
import classNames from "classnames";
import dashify from "dashify";
import numeral from "numeral";
import style from "./index.module.css";
// import {useTournament} from "../../hooks";

export function ScoreTable({compact, title, tourney, getPlayer}) {
    const {tieBreaks, roundList} = tourney;
    const tieBreakNames = getTieBreakNames(tieBreaks);
    const standingTree = pipe(
        rounds2Matches,
        matches2ScoreData,
        (data) => createStandingList(tieBreaks, data),
        (list) => list.filter((obj) => !isDummyObj(obj)),
        createStandingTree
    )(roundList);
    return (
        <table
            className={classNames(style.table, {[`${style.compact}`]: compact})
            }
        >
            <caption
                className={(compact) ? "title-30" : "title-40"}
            >
                {title}
            </caption>
            <thead>
                <tr className={style.topHeader}>
                    <th className="title-10" scope="col">Rank</th>
                    <th className="title-10" scope="col">Name</th>
                    <th className="title-10" scope="col">Score</th>
                    {!compact && tieBreakNames.map((name, i) => (
                        <th key={i} className="title-10" scope="col">
                            {name}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {standingTree.map((standingsFlat, rank) =>
                    standingsFlat.map((standing, i, src) => (
                        <tr key={standing.id} className={style.row}>
                            {i === 0 && ( // Only display the rank once
                                <th
                                    className={"table__number " + style.rank}
                                    rowSpan={src.length}
                                    scope="row"
                                >
                                    {rank + 1}
                                </th>
                            )}
                            {compact // use <td> if it's compact.
                            ? (
                                <td className={style.playerName}>
                                    {getPlayer(standing.id).firstName}&nbsp;
                                    {getPlayer(standing.id).lastName}
                                </td>
                            ) : ( // Use the name as a header if not compact.
                                <th
                                    className={style.playerName}
                                    data-testid={rank}
                                    scope="row"
                                >
                                    {getPlayer(standing.id).firstName}&nbsp;
                                    {getPlayer(standing.id).lastName}
                                </th>
                            )}
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
                            {!compact && standing.tieBreaks.map((score, j) => (
                                <td
                                    key={j}
                                    className="table__number"
                                    data-testid={dashify(
                                        getPlayer(standing.id).firstName
                                        + getPlayer(standing.id).lastName
                                        + tieBreakNames[j]
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
    compact: PropTypes.bool,
    getPlayer: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    tourney: PropTypes.object.isRequired
};

function SelectTieBreaks({tourney, tourneyDispatch}) {
    const {tieBreaks} = tourney;
    const [selectedTb, setSelectedTb] = useState(null);

    function toggleTb(id = null) {
        const defaultId = (x) => x === null ? selectedTb : x;
        if (tieBreaks.includes(defaultId(id))) {
            tourneyDispatch({id: defaultId(id), type: "DEL_TIEBREAK"});
            setSelectedTb(null);
        } else {
            tourneyDispatch({id: defaultId(id), type: "ADD_TIEBREAK"});
        }
    }

    function moveTb(direction) {
        const index = tieBreaks.indexOf(selectedTb);
        tourneyDispatch({
            newIndex: index + direction,
            oldIndex: index,
            type: "MOVE_TIEBREAK"
        });
    }

    return (
        <PanelContainer className="content-area">
            <Panel>
                <div className="toolbar">
                    <button
                        className="button-micro"
                        disabled={selectedTb === null}
                        onClick={() => toggleTb()}
                    >
                        Toggle
                    </button>
                    <button
                        className="button-micro"
                        disabled={selectedTb === null}
                        onClick={() => moveTb(-1)}
                    >
                        <Icons.ArrowUp/> Move up
                    </button>
                    <button
                        className="button-micro"
                        disabled={selectedTb === null}
                        onClick={() => moveTb(1)}
                    >
                        <Icons.ArrowDown/> Move down
                    </button>
                    <button
                        className={classNames(
                            "button-micro",
                            {"button-primary": selectedTb !== null}
                        )}
                        disabled={selectedTb === null}
                        onClick={() => setSelectedTb(null)}
                    >
                        Done
                    </button>
                </div>
                <table>
                    <caption className="title-30">
                        Selected tiebreak methods
                    </caption>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th><VisuallyHidden>Controls</VisuallyHidden></th>
                        </tr>
                    </thead>
                    <tbody className="content">
                        {tieBreaks.map((id) => (
                            <tr
                                key={id}
                                className={classNames(
                                    {"selected": selectedTb === id}
                                )}
                            >
                                <td>
                                    {tieBreakMethods[id].name}
                                </td>
                                <td style={{width: "48px"}}>
                                    <button
                                        className="button-micro"
                                        disabled={
                                            selectedTb !== null
                                            && selectedTb !== id
                                        }
                                        onClick={() =>
                                            selectedTb === id
                                            ? setSelectedTb(null)
                                            : setSelectedTb(id)
                                        }
                                    >
                                        {selectedTb === id ? "Done" : "Edit"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Panel>
            <Panel>
                <div className="toolbar">&nbsp;</div>
                <table style={{marginTop: "16px"}}>
                    <caption className="title-30">
                        Available tiebreak methods
                    </caption>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th><VisuallyHidden>Controls</VisuallyHidden></th>
                        </tr>
                    </thead>
                    <tbody className="content">
                        {Object.values(tieBreakMethods).map(({name, id}) => (
                            <tr key={id}>
                                <td>
                                    <span
                                        className={
                                            tieBreaks.includes(id)
                                            ? "disabled"
                                            : "enabled"
                                        }
                                    >
                                        {name}
                                    </span>
                                </td>
                                <td>
                                    {!tieBreaks.includes(id) && (
                                        <button
                                            className="button-micro"
                                            onClick={() => toggleTb(id)}
                                        >
                                            Add
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Panel>
        </PanelContainer>
    );
}
SelectTieBreaks.propTypes = {
    tourney: PropTypes.object.isRequired,
    tourneyDispatch: PropTypes.func.isRequired
};

export default function Scores({tournament}) {
    const {getPlayer, tourney, tourneyDispatch} = tournament;
    return (
        <Tabs>
            <TabList>
                <Tab><Icons.List /> Scores</Tab>
                <Tab><Icons.Settings /> Edit tiebreak rules</Tab>
            </TabList>
            <TabPanels>
                <TabPanel>
                    <ScoreTable
                        title="Score detail"
                        tourney={tourney}
                        getPlayer={getPlayer}
                    />
                </TabPanel>
                <TabPanel>
                    <SelectTieBreaks
                        tourney={tourney}
                        tourneyDispatch={tourneyDispatch}
                    />
                </TabPanel>
            </TabPanels>
        </Tabs>
    );
}
Scores.propTypes = {
    tournament: PropTypes.object.isRequired
};
