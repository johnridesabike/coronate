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

function Round ({round}) {
  const [matches, setMatches] = useState([].concat(round.matches));
  const setWinner = (match, color, index, event) => {
    if(event.target.checked) {
      if(color === 0) {
        match.whiteWon();
      } else if (color === 1) {
        match.blackWon();
      } else if (color === 0.5) {
        match.draw();
      }
    } else {
      match.resetResult();
    }
    matches[index] = match;
    setMatches([].concat(matches));
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
            <tr key={i}>
              <td>
                <form>
                  <input 
                    type="checkbox"
                    checked={match.result[0] === 1}
                    onChange={(event) => setWinner(match, 0, i, event)} />
                </form>
              </td>
              <td>{match.newRating[0] - match.origRating[0]}</td>
              <td>{match.whitePlayer.firstName}</td>
              <td>
                <form>
                  <input 
                    type="checkbox"
                    checked={match.result[0] === 0.5}
                    onChange={(event) => setWinner(match, 0.5, i, event)} />
                </form>
              </td>
              <td>{match.blackPlayer.firstName}</td>
              <td>{match.newRating[1] - match.origRating[1]}</td>
              <td>
                <form>
                  <input 
                    type="checkbox"
                    checked={match.result[1] === 1}
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
        {tourney.playerStandings(roundNum).map((player, i) => 
          <tr key={i}>
            <td>{player.firstName}</td>
            <td className="table__number">{tourney.playerScore(player, roundNum)}</td>
            <td className="table__number">{tourney.modifiedMedian(player, roundNum)}</td>
            <td className="table__number">{tourney.solkoff(player, roundNum)}</td>
            <td className="table_number">{tourney.playerScoreCum(player, roundNum)}</td>
            <td className="table_number">{tourney.playerOppScoreCum(player, roundNum)}</td>
            <td>{player.rating}</td>
            <td className="table__number">{tourney.playerColorBalance(player, roundNum)}</td>
            <td className="table__number">{tourney.playerOppHistory(player, roundNum).length}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export {Roster, Round, Standings};