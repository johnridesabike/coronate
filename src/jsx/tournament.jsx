// @ts-check
import React, {useState, useEffect, Fragment} from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import {createTournament, scores} from "../chess-tourney";
import {TourneySetup} from "./tourney-setup.jsx"
import {RoundContainer} from "./round.jsx";
/**
 * @typedef {import("react")} React
 * @typedef {import("../chess-tourney").PlayerManager} PlayerManager
 * @typedef {import("../chess-tourney").Tournament} Tournament
 */
/**
 * @param {Object} props
 * @param {PlayerManager} props.playerManager
 * @param {Tournament} props.openTourney
 * @param {Tournament[]} props.tourneyList
 * @param {React.Dispatch<React.SetStateAction<Tournament[]>>} props.setTourneyList
 * @param {React.Dispatch<React.SetStateAction<Tournament>>} props.setOpenTourney
 */
export function TournamentList({playerManager, tourneyList, setTourneyList, openTourney, setOpenTourney}) {
    const newTourneyDefaults = {name: "The most epic tournament"};
    const [newTourneyData, setNewTourneyData] = useState(newTourneyDefaults);
    const newTourney = function(event) {
        event.preventDefault();
        let tourney = createTournament();
        tourney.name = event.target.name.value;
        tourney.id = tourneyList.length;
        let newTList = [tourney];
        setTourneyList(newTList.concat(tourneyList))
        setNewTourneyData(newTourneyDefaults);
        setOpenTourney(tourney);
    };
    const updateField = function (event) {
        /** @type {Object<string, string>} */
        let update = {};
        update[event.target.name] = event.target.value
        setNewTourneyData(Object.assign({}, newTourneyData, update));
    };
    const selectTourney = function (event) {
        const id = event.target.dataset.id;
        setOpenTourney(tourneyList[id])
    };
    let content = <Fragment></Fragment>;
    if (openTourney) {
        content = 
        <TournamentFrame 
            key={openTourney.id}
            tourney={openTourney}
            playerManager={playerManager}
            setOpenTourney={setOpenTourney} />
    } else {
        content = 
        <Fragment>
            {(tourneyList.length > 0)
            ?
                <ol>
                    {tourneyList.map((tourney, i) => 
                        <li key={i} data-id={i}  tabIndex={0} role="menuitem"
                            onClick={selectTourney} onKeyPress={selectTourney}>
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
        </Fragment>
    }
    return (
        <main>
            {content}
        </main>
    );
}

function TournamentFrame({tourney, playerManager, setOpenTourney}) {
    const [playerList, setPlayerList] = useState(tourney.players.roster);
    const [roundNums, setRoundNums] = useState(
        [...Array(tourney.getNumOfRounds()).keys()]
    );
    useEffect(function () {
        setRoundNums([...Array(tourney.getNumOfRounds()).keys()]);
    }, [playerList]);
    const [roundList, setRoundList] = useState(tourney.roundList);
    const isRoundReady = function (id) {
        // we also return if it's the next available round so the user can begin it
        return roundList[id] || id === roundList.length;
    }
    return (
        <Tabs>
            <button onClick={() => setOpenTourney(null)}>&lt; back</button>
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
                    playerList={playerList}
                    tourney={tourney} playerManager={playerManager}/>
            </TabPanel>
            <TabPanel>
                <Standings tourney={tourney} />
            </TabPanel>
            {roundNums.map((roundNum) => 
                <TabPanel key={roundNum}>
                    <RoundContainer key={roundNum} tourney={tourney}
                        round={roundList[roundNum]} roundList={roundList}
                        setRoundList={setRoundList} />
                </TabPanel>
            )}
        </Tabs>
    );
}

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
