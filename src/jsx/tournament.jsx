// @ts-check
import React, {useState, useEffect, Fragment} from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import {createTournament, scores} from "../chess-tourney";
import {TourneySetup} from "./tourney-setup.jsx";
import {RoundManage} from "./round.jsx";
import {range} from "lodash";
import {BackButton} from "./utility";
/**
 * @typedef {import("../chess-tourney").PlayerManager} PlayerManager
 * @typedef {import("../chess-tourney").Tournament} Tournament
 * @typedef {import("../chess-tourney").Match} Match
 */
/**
 * @param {Object} props
 * @param {PlayerManager} props.playerManager
 * @param {Tournament} props.openTourney
 * @param {Tournament[]} props.tourneyList
 * @param {React.Dispatch<React.SetStateAction<Tournament[]>>} props.setTourneyList
 * @param {React.Dispatch<React.SetStateAction<Tournament>>} props.setOpenTourney
 */
export function TournamentList({
    playerManager,
    tourneyList,
    setTourneyList,
    openTourney,
    setOpenTourney
}) {
    const newTourneyDefaults = {name: "The most epic tournament"};
    const [newTourneyData, setNewTourneyData] = useState(newTourneyDefaults);
    /** @param {React.FormEvent<HTMLFormElement>} event */
    const newTourney = function(event) {
        event.preventDefault();
        let tourney = createTournament({players: playerManager});
        tourney.name = newTourneyData.name;
        tourney.id = tourneyList.length;
        let newTList = [tourney];
        setTourneyList(newTList.concat(tourneyList));
        setNewTourneyData(newTourneyDefaults);
        setOpenTourney(tourney);
    };
    /** @param {React.ChangeEvent<HTMLInputElement>} event */
    const updateField = function (event) {
        /** @type {Object<string, string>} */
        const update = {};
        update[event.target.name] = event.target.value;
        setNewTourneyData(Object.assign({}, newTourneyData, update));
    };
    /** @param {number} id */
    const selectTourney = function (id) {
        setOpenTourney(tourneyList[id]);
    };
    let content = <Fragment></Fragment>;
    if (openTourney) {
        content =
        <TournamentFrame
            key={openTourney.id}
            tourney={openTourney}
            playerManager={playerManager}
            setOpenTourney={setOpenTourney} />;
    } else {
        content =
        <Fragment>
            {(tourneyList.length > 0)
            ?
                <ol>
                    {tourneyList.map((tourney, i) =>
                        <li key={i} tabIndex={0} role="menuitem"
                            onClick={() => selectTourney(i)}
                            onKeyPress={() => selectTourney(i)}>
                            {tourney.name}
                        </li>
                    )}
                </ol>
            :
                <p>
                    No tournaments added yet.
                </p>
            }
            <form onSubmit={newTourney}>
                <input type="text" name="name" value={newTourneyData.name}
                    onChange={updateField} required />
                <input type="submit" value="New Tournament" />
            </form>
        </Fragment>;
    }
    return (
        <main>
            {content}
        </main>
    );
}

/**
 *
 * @param {Object} props
 * @param {Tournament} props.tourney
 * @param {PlayerManager} props.playerManager
 * @param {React.Dispatch<React.SetStateAction<Tournament>>} props.setOpenTourney
 */
function TournamentFrame({tourney, playerManager, setOpenTourney}) {
    const [playerList, setPlayerList] = useState(tourney.roster);
    const [roundNums, setRoundNums] = useState(range(tourney.getNumOfRounds()));
    useEffect(function () {
        setRoundNums(range(tourney.getNumOfRounds()));
    }, [playerList]);
    /** @type {Match[][]} */
    const defaultRounds = [[]];
    const [roundList, setRoundList] = useState(defaultRounds);
    /** @param {number} id */
    function isRoundReady(id) {
        return roundList[id];
    };
    function newRound() {
        setRoundList(roundList.concat([]));
    }
    return (
        <Tabs>
            <BackButton action={() => setOpenTourney(null)} />
            <h2>{tourney.name}</h2>
            <TabList>
                <Tab>Setup</Tab>
                <Tab disabled={playerList.length === 0}>Standings</Tab>
                {roundNums.map((roundNum) =>
                    <Tab key={roundNum} disabled={!isRoundReady(roundNum)}>
                        Round {roundNum + 1}
                    </Tab>
                )}
            </TabList>
            <TabPanel>
                <TourneySetup key={tourney.id} setPlayerList={setPlayerList}
                    playerList={playerList} newRound={newRound}
                    tourney={tourney} playerManager={playerManager}/>
            </TabPanel>
            <TabPanel>
                <Standings tourney={tourney} />
            </TabPanel>
            {roundNums.map((roundNum) =>
                <TabPanel key={roundNum}>
                    <RoundManage
                        key={roundNum}
                        setRoundList={setRoundList}
                        roundList={roundList}
                        roundId={roundNum}
                        newRound={newRound}
                        tourney={tourney} />
                </TabPanel>
            )}
        </Tabs>
    );
}

/**
 *
 * @param {Object} props
 * @param {Tournament} props.tourney
 */
export function Standings({tourney}) {
    return (
      <table>
        <caption>Current Standings</caption>
        <thead>
          <tr>
            <th></th>
            <th>First name</th>
            <th>Score</th>
            {tourney.tieBreak.filter((m) => m.active).map((method, i) =>
                <th key={i}>{method.name}</th>
            )}
          </tr>
        </thead>
        {scores.calcStandings(tourney).map((rank, i) =>
          <tbody key={i}>
            {rank.map((standing) =>
              <tr key={standing.id}>
                  <td>{i + 1}</td>
                  <td>{standing.player.firstName}</td>
                  <td className="table__number">{standing.scores.score}</td>
                  {tourney.tieBreak.filter((m) => m.active).map((method, i) =>
                      <td className="table__number" key={i}>
                          {standing.scores[method.name]}
                      </td>
                  )}
              </tr>
              )}
          </tbody>
        )}
      </table>
    );
}
