// @ts-check
import React, {Fragment, useState} from "react";
import {Tabs, TabList, Tab, TabPanels, TabPanel} from "@reach/tabs";
import {BackButton} from "../utility";
import {getPlayer, dummyPlayer} from "../../chess-tourney/player";
import createTournament from "../../chess-tourney/tournament";
import {calcStandings} from "../../chess-tourney/scores";
import {calcNumOfRounds} from "../../chess-tourney/utility";
import Round from "./round";
import PlayerSelect from "./player-select";
import last from "lodash/last";


export function TournamentList({
    playerList,
    setPlayerList,
    avoidList,
    tourneyList,
    setTourneyList,
    options
}) {
    const [openTourney, setOpenTourney] = useState(null);
    const [newTourneyName, setNewTourneyName] = useState("");
    function updateNewName(event) {
        setNewTourneyName(event.target.value);
    }
    function makeTournament(event) {
        event.preventDefault();
        setTourneyList(tourneyList.concat([
            createTournament({
                name: newTourneyName
            })
        ]));
        setNewTourneyName("");
    }
    function removeTourney(index) {
        tourneyList.splice(index, 1);
        setPlayerList([...playerList]);
    }
    let content = <Fragment></Fragment>;
    if (openTourney !== null) {
        content = (
            <TournamentTabs
                tourneyId={openTourney}
                playerList={playerList}
                setOpenTourney={setOpenTourney}
                backButton={<BackButton action={() => setOpenTourney(null)}/>}
                avoidList={avoidList}
                setPlayerList={setPlayerList}
                tourneyList={tourneyList}
                setTourneyList={setTourneyList}
                options={options} />
        );
    } else {
        content = (
            <div>
            {(
                (tourneyList.length > 0)
                ?
                    <ol>
                    {tourneyList.map((tourney, i) =>
                        <li key={i}>
                            <button
                                className="tourney-select"
                                onClick={() => setOpenTourney(i)}>
                                {tourney.name}
                            </button>
                            <button
                                className="danger"
                                onClick={() => removeTourney(i)}>
                                delete
                            </button>
                        </li>
                    )}
                    </ol>
                :
                    <p>
                        No tournaments added yet.
                    </p>
            )}
                <form onSubmit={makeTournament}>
                    <fieldset>
                        <legend>Make a new tournament</legend>
                        <input
                            type="text"
                            placeholder="tournament name"
                            value={newTourneyName}
                            onChange={updateNewName}
                            required={true}/>
                        <input type="submit" value="Create" />
                    </fieldset>
                </form>
            </div>
        );
    }
    return (
        <div>
            {content}
        </div>
    );
}

/**
 *
 * @param {Object} props
 */
export function TournamentTabs({
    tourneyId,
    playerList,
    setPlayerList,
    backButton,
    avoidList,
    tourneyList,
    setTourneyList,
    options
}) {
    const tourney = tourneyList[tourneyId];
    const players = tourney.players;
    const [defaultTab, setDefaultTab] = useState(0);
    const [standingTree, tbMethods] = calcStandings(
        tourney.tieBreaks,
        tourney.roundList
    );
    console.log(standingTree);
    function newRound() {
        const round = [];
        tourney.roundList = tourney.roundList.concat([round]);
        setTourneyList([...tourneyList]);
        setDefaultTab(tourney.roundList.length + 1);
    }
    function delLastRound() {
        const round2Del = last(tourney.roundList);
        // if a match hasn't been scored, then reset it.
        round2Del.forEach(function (match) {
            if (match.result.reduce((a, b) => a + b) !== 0) {
               match.players.forEach(function (pId, color) {
                    getPlayer(pId, playerList).matchCount -= 1;
                    getPlayer(pId, playerList).rating = match.origRating[color];
                });
            }
        });
        tourney.roundList = tourney.roundList.slice(
            0,
            tourney.roundList.length - 1
        );
        setTourneyList([...tourneyList]);
    }
    return (
        <Tabs defaultIndex={defaultTab}>
            {backButton}
            <div>
                <h2>{tourney.name}</h2>
                Round progress: {tourney.roundList.length}/
                {calcNumOfRounds(players.length)}
                <button onClick={() => newRound()}>New Round</button>
                <button
                    onClick={() => delLastRound()}
                    disabled={tourney.roundList.length === 0}>
                    Remove last round
                </button>
            </div>
            <TabList>
                <Tab>Players</Tab>
                <Tab>Scores</Tab>
                {Object.keys(tourney.roundList).map((id) =>
                    <Tab key={id}>Round {Number(id) + 1}</Tab>
                )}
            </TabList>
            <TabPanels>
            <TabPanel>
                <PlayerSelect
                    tourneyList={tourneyList}
                    setTourneyList={setTourneyList}
                    tourneyId={tourneyId}
                    playerList={playerList}/>
            </TabPanel>
            <TabPanel>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Score</th>
                                {tbMethods.map((name, i) =>
                                    <th key={i}>{name}</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                        {standingTree.map((standingsFlat, rank) =>
                            standingsFlat.filter(
                                (p) => p.id !== dummyPlayer.id
                            ).map((standing) =>
                                <tr key={standing.id}>
                                    <td className="table__number">
                                        {rank + 1}
                                    </td>
                                    <td>
                                        {getPlayer(
                                            standing.id,
                                            playerList
                                        ).firstName}
                                    </td>
                                    <td className="table__number">
                                        {standing.score}
                                    </td>
                                    {standing.tieBreaks.map((score, i) =>
                                        <td key={i} className="table__number">
                                            {score}
                                        </td>
                                    )}
                                </tr>
                            )
                        )}
                        </tbody>
                    </table>
            </TabPanel>
            {tourney.roundList.map((matchList, id) =>
                <TabPanel key={id}>
                    <Round
                        matchList={matchList}
                        roundId={id}
                        playerList={playerList}
                        avoidList={avoidList}
                        tourneyList={tourneyList}
                        tourneyId={tourneyId}
                        setTourneyList={setTourneyList}
                        setPlayerList={setPlayerList}
                        options={options} />
                </TabPanel>
            )}
            </TabPanels>
        </Tabs>
    );
}
