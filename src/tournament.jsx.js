/**
 * The components in this file will eventually replace the v1 file.
 */
import React, {useState, useEffect, Fragment} from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import {createTournament, scores} from "./chess-tourney";

export function TournamentList({playerManager, tourneyList, setTourneyList}) {
    const newTourneyDefaults = {name: "The most epic tournament"};
    const [newTourneyData, setNewTourneyData] = useState(newTourneyDefaults);
    const [openTourney, setOpenTourney] = useState(null);
    const newTourney = function(event) {
        event.preventDefault();
        let tourney = createTournament(event.target.name.value);
        setTourneyList([...tourneyList,...[tourney]])
        setNewTourneyData(newTourneyDefaults);
        setOpenTourney(tourney);
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
                <Tournament tourney={openTourney} playerManager={playerManager} />
            }
        </main>
    );
}

function Tournament({tourney, playerManager}) {
    const [roster, setRoster] = useState(tourney.roster.all);
    return (
        <Tabs>
            <h2>{tourney.name}</h2>
            <TabList>
                <Tab>Setup</Tab>
                <Tab>Standings</Tab>
            </TabList>
            <TabPanel>
                <TourneySetup tourney={tourney} playerManager={playerManager}/>
            </TabPanel>
            <TabPanel>
                <Standings tourney={tourney} />
            </TabPanel>
        </Tabs>
    );
}

function TourneySetup({tourney, playerManager}) {
    const [roster, setRoster] = useState(tourney.roster.all);
    const [isSelecting, setIsSelecting] = useState(roster.length === 0);
    if (isSelecting) {
        return <PlayerSelect
            tourney={tourney} 
            playerManager={playerManager}
            setIsSelecting={setIsSelecting}
            setRoster={setRoster} />
    } else {
        return <TourneyManager 
            tourney={tourney}
            roster={roster}
            setRoster={setRoster}
            setIsSelecting={setIsSelecting} />
    }
}

function PlayerSelect({playerManager, tourney, setIsSelecting, setRoster}) {
    const [checked, setChecked] = useState(tourney.roster.all.map((p) => p.id));
    const toggleCheck = function (event) {
        const id = Number(event.target.dataset.id);
        if (checked.includes(id)) {
            setRoster([...tourney.roster.all]);
            setChecked(checked.filter((i) => i !== id));
        } else {
            setRoster([...tourney.roster.all]);
            setChecked([id].concat(checked));
        }
    };
    useEffect(function () {
        tourney.roster.setByIdList(playerManager, checked);
    });
    const globalRoster = playerManager.roster;
    return (
        <Fragment>
            <p>
                Select your players.
            </p>
            <ul>
            {globalRoster.map((player) =>
                <li key={player.id}>
                    <input type="checkbox" data-id={player.id}
                        onChange={toggleCheck}
                        checked={checked.includes(player.id)}
                        disabled={tourney.roster.canRemovePlayerById(player.id)} />
                    {player.firstName} {player.lastName}
                </li>    
            )}
            </ul>
            <button onClick={() => setChecked(globalRoster.map((p) => p.id))}>
                Select all
            </button>
            <button onClick={() => setChecked([])}>
                Select none
            </button>
            <button onClick={() => setIsSelecting(false)}>
                Done
            </button>
        </Fragment>
    );
}

export function TourneyManager({tourney, roster, setRoster, setIsSelecting}) {
    const [byeQueue, setByeQueue] = useState(tourney.byeQueue);
    const byeSignUp = (player) => {
        tourney.addPlayerToByeQueue(player);
        setByeQueue([].concat(tourney.byeQueue));
    };
    const byeDrop = (player) => {
        tourney.removePlayerFromByeQueue(player);
        setByeQueue([].concat(tourney.byeQueue));
    };
    let byeList = "";
    if (byeQueue.length > 0) {
        byeList = (
            <Fragment>
                <h2>Bye signups:</h2>
                <ol>
                {byeQueue.map((player) =>  
                    <li key={player.id}
                        className={player.hasHadBye(tourney) ? "inactive" : "active"}>
                        {player.firstName}
                        <button
                            onClick={() => byeDrop(player)}
                            disabled={player.hasHadBye(tourney)}>
                            x
                        </button>
                    </li>
                )}
                </ol>
            </Fragment>
        )
    }
    let rosterTable = (
        <table>
            <caption>Roster</caption>
            <thead>
                <tr>
                <th>First name</th>
                <th>Rating</th>
                <th>Rounds played</th>
                <th></th>
                </tr>
            </thead>
            <tbody>
                { roster.map((player, i) =>
                <tr key={i} 
                    className={tourney.roster.inactive.includes(player) ? "inactive" : "active"}>
                    <td className="table__player">{player.firstName}</td>
                    <td className="table__number">{player.rating}</td>
                    <td className="table__number">
                    {tourney.getMatchesByPlayer(player).length}
                    </td>
                    <td>
                    {tourney.roster.getActive().length % 2 !== 0 &&
                        (tourney.byeQueue.includes(player) || player.hasHadBye(tourney)
                        ? <button disabled>Bye</button>
                        : <button onClick={() => byeSignUp(player)}>Bye</button>)
                    }
                    </td>
                </tr>
                )}
            </tbody>
        </table>
    );
    return (
        <Fragment>
            {rosterTable}
            {byeList}
            <button onClick={() => setIsSelecting(true)}>
                Select players
            </button>
            <Options tourney={tourney} />
        </Fragment>
    );
}

function Options({tourney}) {
    const [tbOptions, setTbOptions] = useState(tourney.tieBreak);
    const tbToggle = (event) => {
        let key = event.target.dataset.key;
        tbOptions[key].active = event.target.checked;
        setTbOptions([...tbOptions]);
    };
    const tbMove = (pos, dir) => {
        const newPos = pos + dir;
        const newTbOptions = [...tbOptions];
        const movedMethod = newTbOptions.splice(pos, 1)[0];
        newTbOptions.splice(newPos, 0, movedMethod);
        setTbOptions(newTbOptions);
    };
    useEffect(function () {
        tourney.tieBreak = tbOptions
    });
    let tieBreaks = tbOptions.map((method, i) => 
        <li key={i}>
            <input 
                type="checkbox"
                data-pos={i} 
                checked={method.active} 
                onChange={tbToggle}/>
            {method.name}
            <button onClick={() => tbMove(i, -1)} disabled={i === 0}>
                <span role="img" aria-label="Move up">↑</span>
            </button>
            <button onClick={() => tbMove(i, 1)}
                disabled={i === tbOptions.length - 1} >
                <span role="img" aria-label="Move down">↓</span>
            </button>
        </li>
    );
    return (
        <section>
            <h3>Options</h3>
            <h3>Tie break priority</h3>
            <ol>
                {tieBreaks}
            </ol>
        </section>
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