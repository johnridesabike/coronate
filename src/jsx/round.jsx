// @ts-check
import React, {useState, useEffect, Fragment} from "react";
import {scores, pairPlayers, createMatch} from "../old-chess-tourney";
import numeral from "numeral";
import "../round.css";
import {PanelContainer, Panel, moveArrItem} from "./utility";
/**
 * @typedef {import("../old-chess-tourney").Tournament} Tournament
 * @typedef {import("../old-chess-tourney").Round} Round
 * @typedef {import("../old-chess-tourney").Match} Match
 * @typedef {import("../old-chess-tourney").PlayerInfo} PlayerInfo
 * @typedef {import("../old-chess-tourney").Player} Player
 */
/**
 * @param {Object} props
 * @param {number} props.roundId
 * @param {function} props.newRound
 * @param {Match[][]} props.roundList
 * @param {Tournament} props.tourney
 * @param {React.Dispatch<React.SetStateAction<Match[][]>>} props.setRoundList
 */
export function RoundManage({
    roundId,
    newRound,
    roundList,
    setRoundList,
    tourney
}) {
    const round = roundList[roundId];
    const getPlayer = tourney.players.getPlayerById;
    /** @type {Match[]} */
    const defaultMatches = [];
    const [matches, setMatches] = useState(defaultMatches);
    const [unMatched, setUnmatched] = useState(tourney.roster);
    /** @type {number[]} */
    const defaultToPair = [];
    const [toPair, setToPair] = useState(defaultToPair);
    // The UI directly gets data from the `match` object, so this is mostly just
    // to keep the state updated.
    const fetchResults = () => matches.map((m) => m.result);
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
    function delRound() {
        // tourney.removeRound(round);
        matches.forEach(function (match) {
            match.cancel();
        });
        setRoundList([...roundList.filter((r) => r !== round)]);
    };
    function autoPair() {
        const players = tourney.roster; //round.getUnmatchedPlayers(false);
        const newMatches = pairPlayers(
            players,
            roundId,
            roundList,
            tourney
        ).map(
            (pair) => createMatch({roster: pair}, tourney.players)
        );
        // round.matches = round.matches.concat();
        setMatches(matches.concat(newMatches));
    }
    function pairChecked() {
        const match = createMatch(
            {roster: [toPair[0], toPair[1]]},
            tourney.players
        );
        matches.push(match);
        setMatches(matches);
        setToPair([]);
    }
    /** @param {number} position */
    function rmMatch(position) {
        const removed = matches[position].cancel();
        setMatches(matches.filter((m) => m !== removed));
    }
    // useEffect(function () {
    //     round.matches = matches;
    //     setUnmatched(round.getUnmatchedPlayers());
    //     setMatchResults(fetchResults());
    //     setCanMakeNewRound(round.isComplete());
    // });
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
                <caption>Round {roundId + 1} results</caption>
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
            <button onClick={() => newRound()}>
                Next round
            </button>
            <button
                onClick={delRound}
                disabled={true}
                // disabled={tourney.canRemoveRound(round)}
                >
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