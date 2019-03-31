import React, { useState } from 'react';
import {createPlayer, scores} from './chess-tourney';
import demoRoster from './demo-players';

function MainRoster ({tourney}) {
  const [roster, setRoster] = useState(tourney.roster.all);
  const [demoLoaded, setDemoLoaded] = useState(false);
  const newPlayer = {firstName: '', lastName: '', rating: 1200};
  const handleSubmit = (event) => {
    event.preventDefault();
    tourney.roster.addPlayer(
        createPlayer(
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
    var players = demoRoster.slice(0,16).map(p => createPlayer(p));
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
  var rosterTable = '';
  if (roster.length > 0) {
    rosterTable = 
    <table><caption>Roster</caption>
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
              {tourney.getMatchesByPlayer(player).length}
            </td>
            <td>
            {tourney.roster.inactive.includes(player)
              ? <button onClick={() => activatePlayer(player)}>Activate</button>
              : <button onClick={() => deactivatePlayer(player)}>x</button>
            }
            </td>
          </tr>
        )}
      </tbody>
    </table>
  }
  return (
    <div className="roster">
      {rosterTable}
      <p>
        <button disabled={demoLoaded} onClick={loadDemo}>Load a demo roster</button>
      </p>
      <p>
        Or add your own players:
      </p>
      <form onSubmit={handleSubmit}>
        <p>
            <label>
            First name&nbsp;
            <input type="text" name="firstName" onChange={updateField} required />
            </label>
        </p>
        <p>
            <label>
            Last name&nbsp;
            <input type="text" name="lastName" onChange={updateField} required />
            </label>
        </p>
        <p>
            <label>
            Rating&nbsp;
            <input type="number" name="rating" onChange={updateField} value="1200" />
            </label>
        </p>
        <input type="submit" value="Add"/>
      </form>
      <p className="center">Total rounds: {tourney.getNumOfRounds()}</p>
    </div>
  );
}

function Round ({tourney, roundId}) {
  /**
   * Be careful when using the `setState` `matches` and the API's `matches`.
   * They have to mirror each other but can't be the same objects.
   */
  const round = tourney.roundList[roundId];
  const [matches, setMatches] = useState(round.matches.map(o => Object.assign({}, o)));
  const [openCards, setCards] = useState([]);
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
  const togglePlayerCard = (id) => {
    if (openCards.includes(id)) {
      setCards(openCards.filter(i => i !== id));
    } else {
      setCards([].concat(openCards).concat([id]));
    }
  }
  const randomize = () => {
    matches.forEach((match, i) => {
      let origMatch = round.matches[i];
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
    <div>
      <table key={round.id} className="table__roster">
        <caption>Round {round.id + 1} results</caption>
        <thead>
          <tr>
            <th>#</th>
            <th>Won</th>
            <th>White</th>
            <th>Draw</th>
            <th>Black</th>
            <th>Won</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match, i) =>
            <tr key={i} className={round.matches[i].isBye() ? 'inactive' : ''}>
              <td className="table__number">{i + 1}</td>
              <td>
                <input 
                  type="checkbox"
                  checked={round.matches[i].getWhite().result === 1}
                  disabled={round.matches[i].isBye()}
                  onChange={(event) => setWinner(0, i, event)} />
              </td>
              <td className="table__player">
                {round.matches[i].getWhite().player.firstName}
                <button onClick={() => togglePlayerCard(i)}>?</button>
                {openCards.includes(i) && 
                  <PlayerCard
                    tourney={tourney}
                    round={round}
                    player={round.matches[i].getWhite().player} />
                }
              </td>
              <td>
                <input 
                  type="checkbox"
                  checked={round.matches[i].getWhite().result === 0.5}
                  disabled={round.matches[i].isBye()}
                  onChange={(event) => setWinner(0.5, i, event)} />
              </td>
              <td className="table__player">
                {round.matches[i].getBlack().player.firstName}
                <button onClick={() => togglePlayerCard(i)}>?</button>
                {openCards.includes(i) && 
                  <PlayerCard
                    tourney={tourney}
                    round={round}
                    player={round.matches[i].getBlack().player} />
                }
              </td>
              <td>
                <input 
                  type="checkbox"
                  checked={round.matches[i].getBlack().result === 1}
                  disabled={round.matches[i].isBye()}
                  onChange={(event) => setWinner(1, i, event)} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <p style={{textAlign: 'center'}}>
        <button onClick={randomize}>Random!</button>
      </p>
      <Standings roundId={round.id} tourney={round.tourney} />
    </div>
  );
}

function PlayerCard({tourney, round, player}) {
  var ratingChange = (
    round.getMatchByPlayer(player).getPlayerInfo(player).newRating
    - round.getMatchByPlayer(player).getPlayerInfo(player).origRating
  );
  if (ratingChange > -1) {
    ratingChange = "+" + ratingChange
  }
  const colorBalance = scores.playerColorBalance(tourney, player, round.id);
  var color = 'Even';
  if (colorBalance > 0) {
    color = 'White +' + colorBalance;
  } else if (colorBalance < 0) {
    color = 'Black +' + Math.abs(colorBalance);
  }
  return (
    <dl className="player-card">
      <dt>Rating</dt>
      <dd>
        {round.getMatchByPlayer(player).getPlayerInfo(player).origRating}
        &nbsp;({ratingChange})
      </dd>
      <dt>Color balance</dt>
      <dd>{color}</dd>
      <dt>Opponent history</dt>
      <dd>
        <ol>
          {tourney.getPlayersByOpponent(player, round.id).map((opponent, i) =>
            <li key={i}>
              {opponent.firstName}
            </li>  
          )}
        </ol>
      </dd>
    </dl>
  );
}

function Standings({tourney, roundId}) {
  return (
    <table key={roundId}>
      <caption>Current Standings</caption>
      <thead>
        <tr>
          <th></th>
          <th>First name</th>
          <th>Score</th>
          <th>Median</th>
          <th>Solkoff</th>
          <th>Cumulative</th>
          <th>Cumulative of opposition</th>
        </tr>
      </thead>
      {scores.calcStandings(tourney, roundId).map((rank, i) => 
        <tbody key={i}>
          {rank.map((player, j) => 
            <tr key={j}>
              <td>{i + 1}</td>
              <td>{player.player.firstName}</td>
              <td className="table__number">{player.score}</td>
              <td className="table__number">{player.modifiedMedian}</td>
              <td className="table__number">{player.solkoff}</td>
              <td className="table__number">{player.scoreCum}</td>
              <td className="table__number">{player.oppScoreCum}</td>
            </tr>
            )}
        </tbody>
      )}
    </table>
  );
}

export {MainRoster, Round, Standings};