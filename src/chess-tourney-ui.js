import React, { useState } from 'react';
import { Player } from './chess-tourney';



function Roster ({tourney}) {
  const [roster, setRoster] = useState(tourney.roster.all);
  const newPlayer = {firstName: '', lastName: '', rating: 1200};
  const handleSubmit = (event) => {
    event.preventDefault();
    setRoster(
      roster.concat([new Player(newPlayer['firstName'], newPlayer['lastName'], newPlayer['rating'])])
    );
  }
  const updateField = (event) => {
    newPlayer[event.target.name] = event.target.value;
  }

  return (
    <div className="roster">
      <table>
        <caption>Roster</caption>
        <thead>
          <tr>
            <th>First name</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          { roster.map((player, i) =>
            <tr key={i}>
              <td>{player.firstName}</td>
              <td className="table__number">{player.rating}</td>
            </tr>
          )}
        </tbody>
      </table>
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
        <input type="submit" value="Add" />
      </form>
    </div>
  );
}

function RoundResults ({round}) {
  return (
    <table key={round.roundNum}>
      <caption>Round {round.roundNum + 1} results</caption>
      <thead>
        <tr>
          <th></th>
          <th>White</th>
          <th>Black</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {round.matches.map((match, i) =>
          <tr key={i}>
            <td>{match.result[0] === 1 ? 'Won' : ''}</td>
            <td>{match.players[0].firstName}</td>
            <td>{match.players[1].firstName}</td>
            <td>{match.result[1] === 1 ? 'Won' : ''}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function Standings ({roundNum, tourney, players}) {
  var playersClone = [].concat(players);
  playersClone.sort((a, b) =>
    tourney.playerScore(b, roundNum) - tourney.playerScore(a, roundNum)
  );
  return (
    <table key={roundNum}>
      <caption>Current Standings</caption>
      <thead>
        <tr>
          <th>First name</th>
          <th>Score</th>
          <th>Color balance</th>
          <th>Opponent count</th>
        </tr>
      </thead>
      <tbody>
        {playersClone.map((player, i) => 
          <tr key={i}>
            <td>{player.firstName}</td>
            <td className="table__number">{tourney.playerScore(player, roundNum)}</td>
            <td className="table__number">{tourney.playerColorBalance(player, roundNum)}</td>
            <td className="table__number">{tourney.playerOppHistory(player, roundNum).length}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export {Roster, RoundResults, Standings};