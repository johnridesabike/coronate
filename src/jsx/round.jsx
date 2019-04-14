// @ts-check
import React, {useState, useEffect, Fragment} from "react";
import {scores} from "../chess-tourney";
import numeral from "numeral";
import "../round.css";
/**
 * @typedef {import("react")} React
 * @typedef {import("../chess-tourney").Tournament} Tournament
 * @typedef {import("../chess-tourney").Round} Round
 */
/**
 * @param {Object} props
 * @param {Tournament} props.tourney
 * @param {Round} props.round
 */
export function RoundContainer({tourney, round, roundList, setRoundList}) {
    if (round) {
        return <Round round={round} setRoundList={setRoundList} />
    } else {
        return <NewRound tourney={tourney} setRoundList={setRoundList} />
    }
}

function NewRound({tourney, setRoundList}) {
    const makeRound = function () {
        tourney.newRound();
        setRoundList([...tourney.roundList]);
    };
    if (tourney.isNewRoundReady()) {
        return (
            <button
                onClick={makeRound}>
                Make new round
            </button>);
    } else {
        return <p>Complete the last round first.</p>
    }
}

function Round({round, setRoundList}) {
    const tourney = round.ref_tourney;
    const [matches, setMatches] = useState(round.matches);
    const delRound = function () {
        tourney.removeRound(round);
        setRoundList([...tourney.roundList]);
    };
    return (
        <Fragment>
            <table className="table__roster">
                <caption>Round {round.id + 1} results</caption>
                <thead>
                <tr>
                    <th>#</th>
                    <th colSpan={2}>White</th>
                    <th>Draw</th>
                    <th colSpan={2}>Black</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {matches.map((match) =>
                    <RoundMatch
                        key={match.id} match={match} />
                )}
                </tbody>
            </table>
            <h2>Actions</h2>
            <button
                onClick={delRound}
                disabled={tourney.canRemoveRound(round)}>
                Delete round
            </button>
        </Fragment>
    );
}

function RoundMatch({match}) {
    // Getting info for the toggleable box
    const round = match.ref_round;
    const tourney = match.ref_tourney;
    const white = match.getWhiteInfo();
    const black = match.getBlackInfo();
    [white, black].forEach(function (info) {
        let rawBalance = scores.playerColorBalance(tourney, info.player, round.id);
        let colorBalance = "Even";
        if (rawBalance < 0) {
            colorBalance = "White +" + Math.abs(rawBalance);
        } else if (rawBalance > 0) {
            colorBalance = "Black +" + rawBalance;
        }
        info.colorBalance = colorBalance;
        info.score = scores.playerScore(tourney, info.player, round.id)
        info.oppList = tourney.getPlayersByOpponent(info.player, round.id);
    });
    const [result, setResult] = useState(match.result);
    const [infoBox, setInfoBox] = useState(false);
    const [ratingDiff, setRatingDiff] = useState([
        white.newRating - white.origRating,
        black.newRating - black.origRating
    ])
    useEffect(function () {
        match.setResult(result);
        setRatingDiff([
            match.getWhiteInfo().newRating - match.getWhiteInfo().origRating,
            match.getBlackInfo().newRating - match.getBlackInfo().origRating
        ])
    }, [result]);
    return (
        <Fragment>
            <tr className={match.isBye() ? "inactive" : ""}>
                <td className="table__number">{match.id + 1}</td>
                <td className="table__player">
                    {white.player.firstName} {white.player.lastName}
                </td>
                <td className="table__input">
                    <input 
                    type="radio"
                    checked={result[0] === 1}
                    disabled={match.isBye()}
                    onChange={() => setResult([1,0])} />
                </td>
                <td className="table__input">
                    <input 
                        type="radio"
                        checked={result[0] === 0.5}
                        disabled={match.isBye()}
                        onChange={() => setResult([0.5, 0.5])} />
                </td>
                <td className="table__input">
                    <input 
                        type="radio"
                        checked={result[1] === 1}
                        disabled={match.isBye()}
                        onChange={() => setResult([0, 1])} />
                </td>
                <td className="table__player">
                    {black.player.firstName} {black.player.lastName}
                </td>
                <td>
                    <button onClick={() => setInfoBox(!infoBox)}>
                        ?
                    </button>
                    {match.warnings}
                </td>
            </tr>
            {infoBox &&
                <Fragment>
                <tr>
                    <td></td>
                    <td colSpan={2}>
                        <PlayerInfo player={white} ratingDiff={ratingDiff[0]}/>
                    </td>
                    <td></td>
                    <td colSpan={2}>
                        <PlayerInfo player={black} ratingDiff={ratingDiff[1]}/>
                    </td>
                    <td></td>
                </tr>
                <tr>
                    <td colSpan={7} style={{textAlign: "center"}}>
                        Match ideal: {numeral(match.ideal).format("00%")}
                    </td>
                </tr>
            </Fragment>
            }
        </Fragment>
    );
}

function PlayerInfo({player, ratingDiff}) {
    return (
        <dl className="player-card">
            <dt>Score</dt>
            <dd>{player.score}</dd>
            <dt>Rating</dt>
            <dd>
                {player.origRating}
                &nbsp;({numeral(ratingDiff).format("+0")})
            </dd>
            <dt>Color balance</dt>
            <dd>{player.colorBalance}</dd>
            <dt>Opponent history</dt>
            <dd>
                <ol>
                {player.oppList.map((opponent) =>
                    <li key={opponent.id}>
                    {opponent.firstName}
                    </li>  
                )}
                </ol>
            </dd>
        </dl>

    );
}