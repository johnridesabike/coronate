import React, {useState} from "react";
import numeral from "numeral";
import {createPlayer, scores, config} from "./chess-tourney";
import demoRoster from "./demo-players.json";

function MainRoster({tourney}) {
    const [roster, setRoster] = useState(tourney.roster.all);
    const [byeQueue, setByeQueue] = useState(tourney.byeQueue);
    const newPlayer = {firstName: "", lastName: "", rating: 1200};
    const handleSubmit = (event) => {
        event.preventDefault();
        tourney.roster.addPlayer(
            createPlayer(
                newPlayer["firstName"],
                newPlayer["lastName"],
                newPlayer["rating"]
            )
        );
        setRoster([].concat(tourney.roster.all));
    };
    const updateField = (event) => {
        newPlayer[event.target.name] = event.target.value;
    };
    const loadDemo = () => {
        var players = demoRoster.slice(0,16).map(p => createPlayer(p));
        tourney.roster.addPlayers(players);
        setRoster([].concat(tourney.roster.all));
    };
    const deactivatePlayer = (player) => {
        var removed = tourney.roster.removePlayer(player);
        if (!removed) {
            tourney.roster.deactivatePlayer(player);
        }
        setRoster([].concat(tourney.roster.all));
    };
    const activatePlayer = (player) => {
        tourney.roster.activatePlayer(player);
        setRoster([].concat(tourney.roster.all));
    };
    const byeSignUp = (player) => {
        tourney.addPlayerToByeQueue(player);
        setByeQueue([].concat(tourney.byeQueue));
    };
    const byeDrop = (player) => {
        tourney.removePlayerFromByeQueue(player);
        setByeQueue([].concat(tourney.byeQueue));
    };
    var rosterTable = "";
    if (roster.length > 0) {
        rosterTable = 
        <table>
            <caption>Roster</caption>
            <thead>
                <tr>
                <th>First name</th>
                <th>Rating</th>
                <th>Rounds played</th>
                <th></th>
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
                    {tourney.roster.inactive.includes(player)
                    ? <button onClick={() => activatePlayer(player)}>Activate</button>
                    : <button onClick={() => deactivatePlayer(player)}>x</button>
                    }
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
    }
    var byeList = "";
    if (tourney.byeQueue.length > 0) {
        byeList = 
        <div>
            <h2>Bye signups:</h2>
            <ol>
                {byeQueue.map((player, i) =>  
                    <li
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
        </div>
    }
    return (
        <div className="roster">
            {rosterTable}
            {byeList}
            <p>
                <button onClick={loadDemo}>Load a demo roster</button>
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
     * Be careful when using the `setState` `matches` and the API"s `matches`.
     * They have to mirror each other but can"t be the same objects.
     */
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
        <div className="round">
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
                {matches.map((match, i) =>
                    <RoundMatch
                        key={i}
                        tourney={tourney}
                        roundId={roundId}
                        matchId={i}
                        setWinner={setWinner} />
                )}
                </tbody>
            </table>
            <p style={{textAlign: "center"}}>
                <button onClick={randomize}>Random!</button>
            </p>
            <Standings roundId={round.id} tourney={round.tourney} />
        </div>
    );
}

function RoundMatch({tourney, roundId, matchId, setWinner}) {
    const round = tourney.roundList[roundId];
    const match = round.matches[matchId];
    const [openCards, setCards] = useState([[]]);
    const isCardOpen = (id) => {
        if(openCards[roundId] === undefined) {
            return false;
        } else {
            return openCards[roundId].includes(id);
        }
    };
    const togglePlayerCard = (id) => {
        var newCards = [...openCards];
        if (newCards[roundId] === undefined) {
            newCards[roundId] = [];
        }
        if (newCards[roundId].includes(id)) {
            newCards[roundId] = newCards[roundId].filter(i => i !== id)
            setCards(newCards);
        } else {
            newCards[roundId] = newCards[roundId].concat([id])
            setCards(newCards);
        }
    };
    return (
        <tr className={match.isBye() ? "inactive" : ""}>
            <td className="table__number">{matchId + 1}</td>
            <td>
                <input 
                type="checkbox"
                checked={match.getWhite().result === 1}
                disabled={match.isBye()}
                onChange={(event) => setWinner(0, matchId, event)} />
            </td>
            <td className="table__player">
                {match.getWhite().player.firstName}
                {isCardOpen(matchId) && 
                <PlayerCard
                    tourney={tourney}
                    round={round}
                    player={match.getWhite().player} />
                }
            </td>
            <td>
                <input 
                    type="checkbox"
                    checked={match.getWhite().result === 0.5}
                    disabled={match.isBye()}
                    onChange={(event) => setWinner(0.5, matchId, event)} />
            </td>
            <td className="table__player">
                {match.getBlack().player.firstName}
                {isCardOpen(matchId) && 
                <PlayerCard
                    tourney={tourney}
                    round={round}
                    player={match.getBlack().player} />
                }
            </td>
            <td>
                <input 
                    type="checkbox"
                    checked={match.getBlack().result === 1}
                    disabled={match.isBye()}
                    onChange={(event) => setWinner(1, matchId, event)} />
            </td>
            <td>
                <button onClick={() => togglePlayerCard(matchId)}>?</button>
                {match.warnings}
            </td>
        </tr>
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
    var color = "Even";
    if (colorBalance > 0) {
        color = "White +" + colorBalance;
    } else if (colorBalance < 0) {
        color = "Black +" + Math.abs(colorBalance);
    }
    return (
        <dl className="player-card">
        <dt>Score</dt>
        <dd>{scores.playerScore(tourney, player, round.id)}</dd>
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
        <dt>Match ideal</dt>
        <dd>
            {numeral(round.getMatchByPlayer(player).ideal).format("00%")}
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
          {config.tieBreak.filter((m) => m.active).map((method, i) =>
              <th key={i}>{method.name}</th>
          )}
        </tr>
      </thead>
      {scores.calcStandings(tourney, roundId).map((rank, i) => 
        <tbody key={i}>
          {rank.map((player, j) => 
            <tr key={j}>
                <td>{i + 1}</td>
                <td>{player.player.firstName}</td>
                <td className="table__number">{player.score}</td>
                {config.tieBreak.filter((m) => m.active).map((method, i) =>
                    <td className="table__number" key={i}>
                        {player[method.func.name]}
                    </td>
                )}
            </tr>
            )}
        </tbody>
      )}
    </table>
  );
}

export {MainRoster, Round, Standings};