import React, {useState, useEffect} from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import {createTournament, scores} from "../chess-tourney";
import {TourneySetup} from "./tourney-setup.jsx"
import {RoundContainer} from "./round.jsx";

export function TournamentList({playerManager, tourneyList, setTourneyList}) {
    const newTourneyDefaults = {name: "The most epic tournament"};
    const [newTourneyData, setNewTourneyData] = useState(newTourneyDefaults);
    const [openTourney, setOpenTourney] = useState(null);
    const newTourney = function(event) {
        event.preventDefault();
        let tourney = createTournament(event.target.name.value);
        tourney.id = tourneyList.length;
        setTourneyList([...tourneyList,...[tourney]])
        setNewTourneyData(newTourneyDefaults);
        setOpenTourney(tourney)
    };
    const updateField = function (event) {
        let update = {};
        update[event.target.name] = event.target.value
        setNewTourneyData(Object.assign({}, newTourneyData, update));
    };
    const selectTourney = function (event) {
        const id = event.target.dataset.id;
        setOpenTourney(tourneyList[id])
    };
    return (
        <main>
            {(tourneyList.length > 0)
            ?
                <ol>
                    {tourneyList.map((tourney, i) => 
                        <li key={i} data-id={i}  tabIndex="0" role="menuitem"
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
            {openTourney &&
                <Tournament 
                    key={openTourney.id}
                    tourney={openTourney}
                    playerManager={playerManager} />
            }
        </main>
    );
}

function Tournament({tourney, playerManager}) {
    const [roster, setRoster] = useState(tourney.roster.all.map((p) => p.id));
    const [roundList, setRoundList] = useState(tourney.roundList);
    const [roundNums, setRoundNums] = useState(
        [...Array(tourney.getNumOfRounds()).keys()]
    );
    useEffect(function () {
        tourney.roster.setByIdList(playerManager, roster);
        setRoundNums([...Array(tourney.getNumOfRounds()).keys()]);
    }, [roster]);
    const isRoundReady = function (id) {
        // we also return if it's the next available round so the user can begin it
        return roundList[id] || id === roundList.length;
    }
    return (
        <Tabs>
            <h2>{tourney.name}</h2>
            <TabList>
                <Tab>Setup</Tab>
                <Tab disabled={roster.length === 0}>Standings</Tab>
                {roundNums.map((roundNum) => 
                    <Tab key={roundNum} disabled={!isRoundReady(roundNum)}>
                        Round {roundNum + 1}
                    </Tab>    
                )}
            </TabList>
            <TabPanel>
                <TourneySetup key={tourney.id} roster={roster} setRoster={setRoster}
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
            {rank.map((player, j) => 
              <tr key={j}>
                  <td>{i + 1}</td>
                  <td>{player.player.firstName}</td>
                  <td className="table__number">{player.score}</td>
                  {tourney.tieBreak.filter((m) => m.active).map((method, i) =>
                      <td className="table__number" key={i}>
                          {player[method.name]}
                      </td>
                  )}
              </tr>
              )}
          </tbody>
        )}
      </table>
    );
}
