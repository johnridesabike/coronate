// @ts-check
import React, {useState, useEffect, Fragment} from "react";
import {scores} from "../chess-tourney";
import numeral from "numeral";
import "../round.css";
import {PanelContainer, Panel, moveArrItem} from "./utility";
/**
 * @typedef {import("../chess-tourney").Tournament} Tournament
 * @typedef {import("../chess-tourney").Round} Round
 * @typedef {import("../chess-tourney").Match} Match
 * @typedef {import("../chess-tourney").PlayerInfo} PlayerInfo
 * @typedef {import("../chess-tourney").Player} Player
 */
/**
 * @param {Object} props
 * @param {Round} props.round
 * @param {function} props.newRound
 * @param {React.Dispatch<React.SetStateAction<Round[]>>} props.setRoundList
 */
export function RoundContainer({round, newRound, setRoundList}) {
    return <RoundManage round={round} newRound={newRound}
        setRoundList={setRoundList} />;
}

/**
 * @param {Object} props
 * @param {Round} props.round
 * @param {function} props.newRound
 * @param {React.Dispatch<React.SetStateAction<Round[]>>} props.setRoundList
 */
function RoundManage({round, newRound, setRoundList}) {
    const tourney = round.ref_tourney;
    const getPlayer = tourney.players.getPlayerById;
    const [matches, setMatches] = useState(round.matches);
    const [unMatched, setUnmatched] = useState(round.getUnmatchedPlayers());
    const [canMakeNewRound, setCanMakeNewRound] = useState(round.isComplete());
    // The UI directly gets data from the `match` object, so this is mostly just
    // to keep the state updated.
    const fetchResults = () => round.matches.map((m) => m.result);
    // eslint-disable-next-line no-unused-vars
    const [matchResults, setMatchResults] = useState(fetchResults);
    /**
     * @param {Match} match
     * @param {number[]} result
     */
    function updateResult(match, result) {
        match.setResult(result);
        setMatchResults(fetchResults());
    }
    /** @type {[number[], React.Dispatch<React.SetStateAction<number[]>>]} */
    const [toPair, setToPair] = useState([]);
    function delRound() {
        tourney.removeRound(round);
        setRoundList([...tourney.roundList]);
    };
    function autoPair() {
        round.autoPair();
        setMatches(round.matches);
    }
    function pairChecked() {
        round.setPair(toPair[0], toPair[1]);
        setMatches(round.matches);
        setToPair([]);
    }
    /** @param {number} position */
    function rmMatch(position) {
        round.removeMatch(position);
        setMatches(round.matches);
    }
    useEffect(function () {
        round.matches = matches;
        setUnmatched(round.getUnmatchedPlayers());
        setMatchResults(fetchResults());
        setCanMakeNewRound(round.isComplete());
    });
    /** @type {[Match, React.Dispatch<React.SetStateAction<Match>>]} */
    const [openMatch, setOpenMatch] = useState(null);
    /** @param {Match} match */
    function toggleOpenMatch(match) {
        if (openMatch === match) {
            setOpenMatch(null);
        } else {
            setOpenMatch(match);
        }
    }
    /**
     * @param {number} pos
     * @param {number} dir
     */
    function moveMatch(pos, dir) {
        setMatches(moveArrItem(matches, pos, dir));
    }
    return (
        <PanelContainer>
            <Panel style={{width: "50%"}}>
            <table className="table__roster">
                <caption>Round {round.id + 1} results</caption>
                <thead>
                <tr>
                    <th className="row__id">#</th>
                    <th className="row__player">White</th>
                    <th className="row__result">Result</th>
                    <th className="row__player">Black</th>
                    <th className="row__controls"></th>
                </tr>
                </thead>
                <tbody>
                {matches.map((match, pos) =>
                    <tr key={match.id}
                        className={match.isBye() ? "inactive" : ""}>
                        <td className="table__number row__id">{pos + 1}</td>
                        <td className="table__player row__player">
                            {match.getWhiteInfo().player.firstName}&nbsp;
                            {match.getWhiteInfo().player.lastName}
                        </td>
                        <td className="data__input row__result">
                            <input
                            type="radio"
                            checked={match.result[0] === 1}
                            disabled={match.isBye()}
                            onChange={() => updateResult(match, [1,0])}
                            />
                            <input
                                type="radio"
                                checked={match.result[0] === 0.5}
                                disabled={match.isBye()}
                                onChange={() => updateResult(match, [0.5, 0.5])}
                                />
                            <input
                                type="radio"
                                checked={match.result[1] === 1}
                                disabled={match.isBye()}
                                onChange={() => updateResult(match, [0, 1])}
                                />
                        </td>
                        <td className="table__player row__player">
                            {match.getBlackInfo().player.firstName}&nbsp;
                            {match.getBlackInfo().player.lastName}
                        </td>
                        <td className="data__input row__controls">
                            <button onClick={() => toggleOpenMatch(match)}>
                                ?
                            </button>
                            <button onClick={() => rmMatch(pos)}>
                                x
                            </button>
                            <button
                                disabled={pos === 0}
                                onClick={() => moveMatch(pos, -1)}>
                                move up
                            </button>
                            <button
                                disabled={pos === matches.length - 1}
                                onClick={() => moveMatch(pos, 1)}>
                                move down
                            </button>
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
            </Panel>
            <Panel>
            {openMatch && <MatchInfo match={openMatch} />}
            {unMatched.length > 0 && (
                <Fragment>
                <h2>Players to pair:</h2>
                <ul>
                {unMatched.map((pId) =>
                    <li key={pId}>
                        <input type="checkbox" checked={toPair.includes(pId)}
                            onChange={() => setToPair([pId, toPair[0]])}/>
                        {getPlayer(pId).firstName} {getPlayer(pId).lastName}
                    </li>
                )}
                </ul>
                </Fragment>
            )}
            <h2>Actions</h2>
            <button onClick={() => pairChecked()}>Pair checked</button>
            <button onClick={autoPair}>Auto pair</button>
            <button onClick={() => newRound()}
                disabled={!canMakeNewRound}>
                Next round
            </button>
            <button
                onClick={delRound}
                disabled={tourney.canRemoveRound(round)}>
                Delete round
            </button>
            </Panel>
        </PanelContainer>
    );
}

/**
 *
 * @param {Object} props
 * @param {Match} props.match
 */
function MatchInfo({match}) {
    const tourney = match.ref_tourney;
    const round = match.ref_round;
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
    return (
        <div>
            <h2>Match info</h2>
            <PlayerRoundInfo player={white} />
            <PlayerRoundInfo player={black} />
        </div>
    );
}
/**
 *
 * @param {Object} props
 * @param {PlayerInfo} props.player
 */
function PlayerRoundInfo({player}) {
    return (
        <dl className="player-card">
            <h3>{player.player.firstName} {player.player.lastName}</h3>
            <dt>Score</dt>
            <dd>{player.score}</dd>
            <dt>Rating</dt>
            <dd>
                {player.origRating}
                &nbsp;
                ({numeral(player.newRating - player.origRating).format("+0")})
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