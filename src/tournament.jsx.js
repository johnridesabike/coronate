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
    const [roster, setRoster] = useState(tourney.roster.all);
    return (
        <Tabs>
            <h2>{tourney.name}</h2>
            <TabList>
                <Tab>Setup</Tab>
                <Tab>Standings</Tab>
            </TabList>
            <TabPanel>
                <TourneySetup key={tourney.id} roster={roster} setRoster={setRoster}
                    tourney={tourney} playerManager={playerManager}/>
            </TabPanel>
            <TabPanel>
                <Standings tourney={tourney} />
            </TabPanel>
        </Tabs>
    );
}

function TourneySetup({tourney, playerManager, roster, setRoster}) {
    const [isSelecting, setIsSelecting] = useState(roster.length === 0);
    if (isSelecting) {
        return <PlayerSelect
            tourney={tourney} 
            playerManager={playerManager}
            setIsSelecting={setIsSelecting}
            roster={roster}
            key={tourney.id}
            setRoster={setRoster} />
    } else {
        return <TourneyManager 
            tourney={tourney}
            roster={roster}
            setRoster={setRoster}
            key={tourney.id}
            setIsSelecting={setIsSelecting} />
    }
}

function PlayerSelect({playerManager, tourney, setIsSelecting, roster, setRoster}) {
    const [checked, setChecked] = useState(roster.map((p) => p.id));
    useEffect(function () {
        tourney.roster.setByIdList(playerManager, checked);
    });
    const toggleCheck = function (event) {
        const id = Number(event.target.dataset.id);
        if (checked.includes(id)) {
            setChecked(checked.filter((i) => i !== id));
        } else {
            setChecked([id].concat(checked));
        }
    };
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
            <button>
                New round
            </button>
            <Options key={tourney.id} tourney={tourney} />
        </Fragment>
    );
}

function Options({tourney}) {
    const [tbOptions, setTbOptions] = useState(tourney.tieBreak);
    const tbToggle = (event) => {
        let id = event.target.dataset.pos;
        tbOptions[id].active = event.target.checked;
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
    return (
        <section>
            <h3>Options</h3>
            <h3>Tie break priority</h3>
            <ol>
            {tbOptions.map((method, i) => 
                <li key={method.funcName}>
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
            )}
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


function Round({tourney, roundId}) {
    const round = tourney.roundList[roundId];
    const [matches, setMatches] = useState(round.matches.map(o => Object.assign({}, o)));
    const setWinner = (color, index, event) => {
        let origMatch = round.matches[index];
        if(event.target.checked) {
            if(color === 0) {
                origMatch.whiteWon();
            } else if (color === 1) {
                origMatch.blackWon();
            } else if (color === 0.5) {
                origMatch.draw();
            }
        } else {
            origMatch.resetResult();
        }
        // matches[index] = match;
        setMatches(round.matches.map(o => Object.assign({}, o)));
    }
    const randomize = () => {
        matches.forEach((match, i) => {
            let origMatch = round.matches[i];
            if (origMatch.isBye()) {
                return;
            }
            let rando = Math.random();
            if (rando >= 0.55) {
                origMatch.whiteWon();
            } else if (rando >= .1) {
                origMatch.blackWon();
            } else {
                origMatch.draw();
            }
        });
        setMatches(round.matches.map(o => Object.assign({}, o)));
    }
    return (
        <Fragment>
            <table className="table__roster">
                <caption>Round {round.id + 1} results</caption>
                <thead>
                <tr>
                    <th>#</th>
                    <th>Won</th>
                    <th>White</th>
                    <th>Draw</th>
                    <th>Black</th>
                    <th>Won</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {/* {matches.map((match, i) =>
                    <RoundMatch
                        key={i}
                        tourney={tourney}
                        roundId={roundId}
                        matchId={i}
                        setWinner={setWinner} />
                )} */}
                </tbody>
            </table>
            <p style={{textAlign: "center"}}>
                <button onClick={randomize}>Random!</button>
            </p>
            <h2>Actions</h2>
            {/* <button
                disabled={round !== last(tourney.roundList)}
                data-roundid={round.id}
                onClick={delFunc}>
                Delete round
            </button> */}
        </Fragment>
    );
}