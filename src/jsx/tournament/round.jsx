// @ts-check
import React, {Fragment, useState} from "react";
import numeral from "numeral";
import {OpenButton, PanelContainer, Panel, BackButton} from "../utility";
import {
    getPlayer,
    calcNewRatings,
    dummyPlayer
} from "../../chess-tourney/player";
import {getPlayerMatchData, hasHadBye} from "../../chess-tourney/scores";
import pairPlayers from "../../chess-tourney/pairing";
import createMatch from "../../chess-tourney/match";
import {BLACK, WHITE} from "../../chess-tourney/constants";
import {
    getById,
    getIndexById
} from "../../chess-tourney/utility";
import arrayMove from "array-move";

export default function Round({
    matchList,
    roundId,
    playerList,
    avoidList,
    tourneyList,
    tourneyId,
    setTourneyList,
    setPlayerList,
    options
}) {
    const tourney = tourneyList[tourneyId];
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    function selectPlayer(event) {
        const pId = Number(event.target.value);
        if (event.target.checked) {
            setSelectedPlayers(function (prevState) {
                // stop React from adding an ID twice in a row
                if (!prevState.includes(pId)) {
                    prevState.push(pId);
                }
                // ensure that only the last two players stay selected.
                return prevState.slice(-2);
            });
        } else {
            setSelectedPlayers(selectedPlayers.filter((id) => id !== pId));
        }
    }
    const roundList = tourney.roundList;
    const matched = matchList.reduce(
        (acc, match) => acc.concat(match.players),
        []
    );
    const unMatched = tourney.players.filter(
        (pId) => !matched.includes(pId)
    );
    function autoPair(unPairedPlayers) {
        const nextBye = tourney.byeQueue.filter(
            (pId) => !hasHadBye(pId, tourney.roundList)
        )[0];
        let byeMatch = null;
        if (nextBye >= 0) {
            byeMatch = createMatch({
                id: nextBye + "-" + dummyPlayer.id,
                players: [nextBye, dummyPlayer.id],
                origRating: [
                    getPlayer(nextBye, playerList).rating,
                    dummyPlayer.rating
                ],
                newRating: [
                    getPlayer(nextBye, playerList).rating,
                    dummyPlayer.rating
                ]
            });
            unPairedPlayers = unPairedPlayers.filter((pId) => pId !== nextBye);
        }
        const pairs = pairPlayers(
            unPairedPlayers,
            roundId,
            tourney.roundList,
            playerList,
            avoidList
        );
        const newMatchList = pairs.map(
            (pair) => createMatch({
                id: pair.join("-"),
                players: [pair[WHITE], pair[BLACK]],
                origRating: [
                    getPlayer(pair[WHITE], playerList).rating,
                    getPlayer(pair[BLACK], playerList).rating
                ],
                newRating: [
                    getPlayer(pair[WHITE], playerList).rating,
                    getPlayer(pair[BLACK], playerList).rating
                ]
            })
        );
        if (byeMatch) {
            newMatchList.push(byeMatch);
        }
        // this covers manual bye matches and auto-paired bye matches
        newMatchList.forEach(function (match) {
            const dummy = match.players.indexOf(dummyPlayer.id);
            if (dummy === BLACK) {
                match.result[WHITE] = options.byeValue;
            }
            if (dummy === WHITE) {
                match.result[BLACK] = options.byeValue;
            }
        });
        tourney.roundList[roundId] = (
            tourney.roundList[roundId].concat(newMatchList)
        );
        setTourneyList([...tourneyList]);
    }
    function manualPair(pair) {
        const match = createMatch({
            id: pair.join("-"),
            players: [pair[WHITE], pair[BLACK]],
            origRating: [
                getPlayer(pair[WHITE], playerList).rating,
                getPlayer(pair[BLACK], playerList).rating
            ],
            newRating: [
                getPlayer(pair[WHITE], playerList).rating,
                getPlayer(pair[BLACK], playerList).rating
            ]
        });
        if (pair[WHITE] === dummyPlayer.id) {
            match.result = [options.byeValue, 0];
        }
        if (pair[BLACK] === dummyPlayer.id) {
            match.result = [0, options.byeValue];
        }
        tourney.roundList[roundId].push(match);
        setTourneyList([...tourneyList]);
    }
    function setMatchResult(matchId, result) {
        const match = getById(tourney.roundList[roundId], matchId);
        const mIndex = tourney.roundList[roundId].indexOf(match);
        const white = getPlayer(match.players[WHITE], playerList);
        const black = getPlayer(match.players[BLACK], playerList);
        const [
            whiteRating,
            blackRating
        ] = calcNewRatings(
            match.origRating,
            [white.matchCount, black.matchCount],
            result
        );
        const isNew = (match.result.reduce((a, b) => a + b) === 0);
        setTourneyList(function (prevTourney) {
            const newTourney = [...prevTourney];
            newTourney[tourneyId].roundList[roundId][mIndex].result = result;
            newTourney[tourneyId].roundList[roundId][mIndex].newRating = [
                whiteRating,
                blackRating
            ];
            return newTourney;
        });
        white.rating = whiteRating;
        black.rating = blackRating;
        if (isNew) {
            white.matchCount += 1;
            black.matchCount += 1;
        }
        setPlayerList([...playerList]);
    }
    function unMatch(matchId) {
        const match = getById(tourney.roundList[roundId], matchId);
        if (match.result.reduce((a, b) => a + b) !== 0) {
            // checks if the match has been scored yet & resets the players'
            // records
            match.players.forEach(function (pId, color) {
                getPlayer(pId, playerList).matchCount -= 1;
                getPlayer(pId, playerList).rating = match.origRating[color];
            });
        }
        tourneyList[tourneyId].roundList[roundId] = (
            tourneyList[tourneyId].roundList[roundId].filter((m) => m !== match)
        );
        setSelectedMatch(null);
        setTourneyList([...tourneyList]);
    }
    function swapColors(matchId) {
        const match = getById(tourney.roundList[roundId], matchId);
        match.players.reverse();
        match.origRating.reverse();
        match.newRating.reverse();
        setTourneyList([...tourneyList]);
    }
    function moveMatch(matchId, direction) {
        const matchesRef = tourneyList[tourneyId].roundList[roundId];
        const mIndex = getIndexById(matchesRef, matchId);
        tourneyList[tourneyId].roundList[roundId] = (
            arrayMove(matchesRef, mIndex, mIndex + direction)
        );
        setTourneyList([...tourneyList]);
    }
    return (
        <PanelContainer>
            <Panel>
            <div className="toolbar">
                <button
                    onClick={() => unMatch(selectedMatch)}
                    disabled={selectedMatch === null}>
                    Unmatch
                </button>
                <button
                    onClick={() => swapColors(selectedMatch)}
                    disabled={selectedMatch === null}>
                    Swap colors
                </button>
                <button
                    onClick={() => moveMatch(selectedMatch, -1)}
                    disabled={selectedMatch === null}>
                    Move up
                </button>
                <button
                    onClick={() => moveMatch(selectedMatch, 1)}
                    disabled={selectedMatch === null}>
                    Move down
                </button>
            </div>
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
                {matchList.map((match, pos) =>
                    <tr key={match.id}>
                        <td className="table__number row__id">{pos + 1}</td>
                        <td className="table__player row__player">
                            {getPlayer(match.players[0], playerList).firstName}
                            &nbsp;
                            {getPlayer(match.players[0], playerList).lastName}
                        </td>
                        <td className="data__input row__result">
                            <input
                                type="radio"
                                checked={(match.result[0] > match.result[1])}
                                onChange={
                                    () => setMatchResult(match.id, [1, 0])
                                }
                                disabled={
                                    match.players.includes(dummyPlayer.id)
                                }/>
                            <input
                                type="radio"
                                checked={match.result.every((x) => x === 0.5)}
                                onChange={
                                    () => setMatchResult(match.id, [0.5, 0.5])
                                }
                                disabled={
                                    match.players.includes(dummyPlayer.id)
                                }/>
                            <input
                                type="radio"
                                checked={(match.result[1] > match.result[0])}
                                onChange={
                                    () => setMatchResult(match.id, [0, 1])
                                }
                                disabled={
                                    match.players.includes(dummyPlayer.id)
                                }/>
                        </td>
                        <td className="table__player row__player">
                            {getPlayer(match.players[1], playerList).firstName}
                            &nbsp;
                            {getPlayer(match.players[1], playerList).lastName}
                        </td>
                        <td className="data__input row__controls">
                        {(
                        (selectedMatch !== match.id)
                        ? <OpenButton
                            action={() => setSelectedMatch(match.id)} />
                        : <BackButton action={() => setSelectedMatch(null)} />
                        )}
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
            </Panel>
            <Panel>
            {selectedMatch !== null &&
                <PanelContainer>
                    <Panel>
                        <PlayerMatchInfo
                            match={getById(matchList, selectedMatch)}
                            color={0}
                            playerData={
                                getPlayerMatchData(
                                    getById(
                                        matchList,
                                        selectedMatch
                                    ).players[0],
                                    roundList,
                                    roundId
                                )
                            }
                            playerList={playerList}/>
                    </Panel>
                    <Panel>
                        <PlayerMatchInfo
                            match={getById(matchList, selectedMatch)}
                            color={1}
                            playerData={
                                getPlayerMatchData(
                                    getById(
                                        matchList,
                                        selectedMatch
                                    ).players[1],
                                    roundList,
                                    roundId
                                )
                            }
                            playerList={playerList} />
                    </Panel>
                </PanelContainer>
            }
            {unMatched.length > 0 && (
                <Fragment>
                    <h3>Unmatched players</h3>
                    <ul>
                        {unMatched.map((pId) =>
                            <li key={pId}>
                                <input
                                    type="checkbox"
                                    checked={selectedPlayers.includes(pId)}
                                    value={pId}
                                    onChange={selectPlayer}/>
                                {getPlayer(pId, playerList).firstName}&nbsp;
                                {getPlayer(pId, playerList).lastName}
                            </li>
                        )}
                        {(unMatched.length % 2 !== 0) &&
                            <li>
                                <input
                                    type="checkbox"
                                    checked={
                                        selectedPlayers.includes(dummyPlayer.id)
                                    }
                                    value={dummyPlayer.id}
                                    onChange={selectPlayer}/>
                                {dummyPlayer.firstName} {dummyPlayer.lastName}
                            </li>
                        }
                    </ul>
                    <button
                        onClick={() => manualPair(selectedPlayers)}
                        disabled={selectedPlayers.length !== 2}>
                        Pair checked
                    </button>&nbsp;
                    <button
                        onClick={() => autoPair(unMatched)}
                        disabled={unMatched.length === 0}>
                        Auto-pair
                    </button>
                </Fragment>
            )}
            </Panel>
        </PanelContainer>
    );
}

function PlayerMatchInfo({match, color, playerData, playerList}) {
    const colorBalance = playerData.colorBalance();
    let prettyBalance = "Even";
    if (colorBalance < 0) {
        prettyBalance = "White +" + Math.abs(colorBalance);
    } else if (colorBalance > 0) {
        prettyBalance = "Black +" + colorBalance;
    }
    return (
        <dl className="player-card">
            <h3>
                {playerData.data(playerList).firstName}&nbsp;
                {playerData.data(playerList).lastName}
            </h3>
            <dt>Score</dt>
            <dd>{playerData.score()}</dd>
            <dt>Rating</dt>
            <dd>
                {match.origRating[color]}
                &nbsp;
                (
                {numeral(
                    match.origRating[color] - match.newRating[color]
                ).format("+0")}
                )
            </dd>
            <dt>Color balance</dt>
            <dd>{prettyBalance}</dd>
            <dt>Opponent history</dt>
            <dd>
                <ol>
                {playerData.opponents(playerList).map((opponent) =>
                    <li key={opponent.id}>
                    {opponent.firstName}
                    </li>
                )}
                </ol>
            </dd>
            <dt>Players to avoid</dt>
            <dd>TBD</dd>
        </dl>
    );
}
