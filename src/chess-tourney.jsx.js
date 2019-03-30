import React, { useState } from 'react';
import { Player } from './chess-tourney';
import demoRoster from './demo-players';

function MainRoster ({tourney}) {
  const [roster, setRoster] = useState(tourney.roster.all);
  const [demoLoaded, setDemoLoaded] = useState(false);
  const newPlayer = {firstName: '', lastName: '', rating: 1200};
  const handleSubmit = (event) => {
    event.preventDefault();
    tourney.addPlayer(
      Player(
        newPlayer['firstName'],
        newPlayer['lastName'],
        newPlayer['rating']
      )
    );
    setRoster([].concat(tourney.roster.all));
  }
  const updateField = (event) => {
    newPlayer[event.target.name] = event.target.value;
  }
  const loadDemo = () => {
    var players = demoRoster.slice(0,16).map(p => Player(p));
    tourney.roster.addPlayers(players);
    setDemoLoaded(true);
    setRoster([].concat(tourney.roster.all));
  }
  const deactivatePlayer = (player) => {
    var baleted = tourney.roster.removePlayer(player);
    if (!baleted) {
      tourney.roster.deactivatePlayer(player);
    }
    setRoster([].concat(tourney.roster.all));
  }
  const activatePlayer = (player) => {
    tourney.roster.activatePlayer(player);
    setRoster([].concat(tourney.roster.all));
  }
  return (
    <div className="roster">
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
              className={tourney.roster.inactive.includes(player) ? 'inactive' : 'active'}>
              <td className="table__player">{player.firstName}</td>
              <td className="table__number">{player.rating}</td>
              <td className="table__number">
                {tourney.playerMatchHistory(player).length}
              </td>
              <td>
              {tourney.roster.inactive.includes(player)
                ? <button onClick={() => activatePlayer(player)}>Activate</button>
                : <button onClick={() => deactivatePlayer(player)}>Deactivate</button>
              }
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <p>
        <button disabled={demoLoaded} onClick={loadDemo}>Load a demo roster</button>
      </p>
      <p>
        Or add your own players:
      </p>
      <form onSubmit={handleSubmit}>
        <label>
          First name
          <input type="text" name="firstName" onChange={updateField} required />
        </label>
        <label>
          Last name
          <input type="text" name="lastName" onChange={updateField} required />
        </label>
        <label>
          Rating
          <input type="number" name="rating" onChange={updateField} value="1200" />
        </label>
        <input type="submit" value="Add"/>
      </form>
      <p className="center">Total rounds: {tourney.numOfRounds()}</p>
    </div>
  );
}

function Round ({tourney, roundNum}) {
  /**
   * Be careful when using the `setState` matches and the API's matches.
   * They have to mirror each other but can't be the same objects.
   */
  const round = tourney.roundList[roundNum];
  const [matches, setMatches] = useState(round.matches.map(o => Object.assign({}, o)));
  const setWinner = (match, color, index, event) => {
    var origMatch = round.matches[index];
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
  return (
    <div>
      <table key={round.roundNum}>
        <caption>Round {round.roundNum + 1} results</caption>
        <thead>
          <tr>
            <th>Won</th>
            <th>Rating change</th>
            <th>White</th>
            <th>Draw</th>
            <th>Black</th>
            <th>Rating change</th>
            <th>Won</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match, i) =>
            <tr key={i} className={round.matches[i].isBye ? 'inactive' : ''}>
              <td>
                <form>
                  <input 
                    type="checkbox"
                    checked={round.matches[i].result[0] === 1}
                    disabled={round.matches[i].isBye}
                    onChange={(event) => setWinner(match, 0, i, event)} />
                </form>
              </td>
              <td className="table__number">{round.matches[i].newRating[0] - round.matches[i].origRating[0]}</td>
              <td className="table__player">{round.matches[i].whitePlayer.firstName}</td>
              <td>
                <form>
                  <input 
                    type="checkbox"
                    checked={round.matches[i].result[0] === 0.5}
                    onChange={(event) => setWinner(match, 0.5, i, event)} />
                </form>
              </td>
              <td className="table__player">{round.matches[i].blackPlayer.firstName}</td>
              <td className="table__number">{round.matches[i].newRating[1] - round.matches[i].origRating[1]}</td>
              <td>
                <form>
                  <input 
                    type="checkbox"
                    checked={round.matches[i].result[1] === 1}
                    disabled={round.matches[i].isBye}
                    onChange={(event) => setWinner(match, 1, i, event)} />
                </form>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <Standings roundNum={round.roundNum} tourney={round.tourney} />
    </div>
  );
}

function Standings({tourney, roundNum}) {
  const round = tourney.roundList[roundNum]
  return (
    <table key={roundNum}>
      <caption>Current Standings</caption>
      <thead>
        <tr>
          <th>First name</th>
          <th>Score</th>
          <th>Median</th>
          <th>Solkoff</th>
          <th>Cumulative</th>
          <th>Cumulative of opposition</th>
          <th>Rating</th>
          <th>Color balance</th>
          <th>Opponent count</th>
        </tr>
      </thead>
      <tbody>
        {tourney.playerStandings(roundNum).map((entry, i) => 
          <tr key={i}>
            <td>{entry.player.firstName}</td>
            <td className="table__number">{entry.score}</td>
            <td className="table__number">{entry.modifiedMedian}</td>
            <td className="table__number">{entry.solkoff}</td>
            <td className="table__number">{entry.scoreCum}</td>
            <td className="table__number">{entry.oppScoreCum}</td>
            <td>
              {/* Get the player's rating for the round, or their rating for
                  the last round they completed. */}
              {round.playerMatch(entry.player)
                ? round.playerMatch(entry.player).playerInfo(entry.player).newRating
                : tourney
                    .playerMatchHistory(entry.player)[tourney.playerMatchHistory(entry.player).length -1]
                    .playerInfo(entry.player)
                    .newRating
              }
            </td>
            <td className="table__number">{tourney.playerColorBalance(entry.player, roundNum)}</td>
            <td className="table__number">{tourney.playerOppHistory(entry.player, roundNum).length}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export {MainRoster, Round, Standings};