// @ts-check
import React, {useState, useEffect, Fragment} from "react";
import {scores} from "../chess-tourney";
import numeral from "numeral";
import "../round.css";
/**
 * @typedef {import("../chess-tourney").Tournament} Tournament
 * @typedef {import("../chess-tourney").Round} Round
 * @typedef {import("../chess-tourney").Match} Match
 * @typedef {import("../chess-tourney").PlayerInfo} PlayerInfo
 * @typedef {import("../chess-tourney").Player} Player
 */
/**
 * @param {Object} props
 * @param {Tournament} props.tourney
 * @param {Round} props.round
 * @param {Round[]} props.roundList
 * @param {React.Dispatch<React.SetStateAction<Round[]>>} props.setRoundList
 */
export function RoundContainer({tourney, round, roundList, setRoundList}) {
    if (round) {
        return <RoundManage round={round} setRoundList={setRoundList} />;
    } else {
        return <NewRound tourney={tourney} setRoundList={setRoundList} />;
    }
}

/**
 * @param {Object} props
 * @param {Tournament} props.tourney
 * @param {React.Dispatch<React.SetStateAction<Round[]>>} props.setRoundList
 */
function NewRound({tourney, setRoundList}) {
    const makeRound = function () {
        const round = tourney.newRound();
        round.autoPair();
        setRoundList([...tourney.roundList]);
    };
    if (tourney.isNewRoundReady()) {
        return (
            <button
                onClick={makeRound}>
                Make new round
            </button>);
    } else {
        return <p>Complete the last round first.</p>;
    }
}

/**
 * @param {Object} props
 * @param {Round} props.round
 * @param {React.Dispatch<React.SetStateAction<Round[]>>} props.setRoundList
 */
function RoundManage({round, setRoundList}) {
    const tourney = round.ref_tourney;
    const [matches] = useState(round.matches);
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

/**
 *
 * @param {Object} props
 * @param {Match} props.match
 */
function RoundMatch({match}) {
    // Getting info for the toggleable box
    const round = match.ref_round;
    const tourney = match.ref_tourney;
    const white = match.getWhiteInfo();
    const black = match.getBlackInfo();
    [white, black].forEach(function (info) {
        let rawBalance = scores.playerColorBalance(
            tourney,
            info.player.id,
            round.id
        );
        let colorBalance = "Even";
        if (rawBalance < 0) {
            colorBalance = "White +" + Math.abs(rawBalance);
        } else if (rawBalance > 0) {
            colorBalance = "Black +" + rawBalance;
        }
        info.colorBalance = colorBalance;
        info.score = scores.playerScore(tourney, info.player.id, round.id);
        info.oppList = tourney.getPlayersByOpponent(
            info.player.id,
            round.id
        ).map((id) => tourney.players.getPlayerById(id));
    });
    const [result, setResult] = useState(match.result);
    const [infoBox, setInfoBox] = useState(false);
    const [ratingDiff, setRatingDiff] = useState([
        white.newRating - white.origRating,
        black.newRating - black.origRating
    ]);
    useEffect(function () {
        match.setResult(result);
        setRatingDiff([
            match.getWhiteInfo().newRating - match.getWhiteInfo().origRating,
            match.getBlackInfo().newRating - match.getBlackInfo().origRating
        ]);
    }, [result]);
    return (
        <Fragment>
            <tr className={(
                (match.isBye())
                ? "inactive"
                : "")}>
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
                        <PlayerRoundInfo player={white}
                            ratingDiff={ratingDiff[0]}/>
                    </td>
                    <td></td>
                    <td colSpan={2}>
                        <PlayerRoundInfo player={black}
                            ratingDiff={ratingDiff[1]}/>
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

/**
 *
 * @param {Object} props
 * @param {PlayerInfo} props.player
 * @param {number} props.ratingDiff
 */
function PlayerRoundInfo({player, ratingDiff}) {
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