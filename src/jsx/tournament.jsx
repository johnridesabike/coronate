// @ts-check
import React, {Fragment, useState} from "react";
// import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import numeral from "numeral";
import "react-tabs/style/react-tabs.css";
import demoTourneyList from "../demo-tourney.json";
import {getPlayer, calcNewRatings} from "../chess-tourney-v2/player";
import scores from "../chess-tourney-v2/scores";
import {OpenButton, PanelContainer, Panel, BackButton} from "./utility";
import pairPlayers from "../chess-tourney-v2/pairing";
import createMatch from "../chess-tourney-v2/match";
import {BLACK, WHITE} from "../chess-tourney-v2/constants";


export function TournamentList({playerList, setPlayerList, avoidList}) {
    const [openTourney, setOpenTourney] = useState(null);
    let content = <Fragment></Fragment>;
    if (openTourney !== null) {
        content = (
            <TournamentTabs
                tourneyId={openTourney}
                playerList={playerList}
                setOpenTourney={setOpenTourney}
                BackButton={<BackButton action={() => setOpenTourney(null)}/>}
                avoidList={avoidList}
                setPlayerList={setPlayerList} />
        );
    } else {
        content = (
            <nav>
            {(
                (demoTourneyList.length > 0)
                ?
                    <ol>
                    {demoTourneyList.map((tourney, i) =>
                        <li key={i}>
                            <button onClick={() => setOpenTourney(i)}>
                                {tourney.name}
                            </button>
                        </li>
                    )}
                    </ol>
                :
                    <p>
                        No tournaments added yet.
                    </p>
            )}
            </nav>
        );
    }
    return (
        <div>
            {content}
        </div>
    );
}

/**
 *
 * @param {Object} props
 */
export function TournamentTabs({
    tourneyId,
    playerList,
    setPlayerList,
    BackButton,
    avoidList
}) {
    const tourney = demoTourneyList[tourneyId];
    const players = tourney.players;
    const [roundList, setRoundList] = useState(tourney.roundList);
    const [defaultTab, setDefaultTab] = useState(0);
    const [standingTree, tbMethods] = scores.calcStandings(
        tourney.tieBreaks,
        roundList
    );
    function newRound() {
        const pairs = pairPlayers(
            players,
            roundList.length - 1,
            roundList,
            playerList,
            avoidList
        );
        const newRound = pairs.map(
            (pair) => createMatch({
                players: [pair[0], pair[1]],
                origRating: [
                    getPlayer(pair[0], playerList).rating,
                    getPlayer(pair[1], playerList).rating
                ],
                newRating: [
                    getPlayer(pair[0], playerList).rating,
                    getPlayer(pair[1], playerList).rating
                ]
            })
        );
        setRoundList(roundList.concat([newRound]));
        setDefaultTab(roundList.length + 1);
    }
    function setMatchResult(roundId, matchId, result) {
        const match = roundList[roundId][matchId];
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
        setRoundList(function (prevRound) {
            const newRound = [...prevRound];
            newRound[roundId][matchId].result = result;
            newRound[roundId][matchId].newRating = [whiteRating, blackRating];
            return newRound;
        });
        white.rating = whiteRating;
        black.rating = blackRating;
        white.matchCount += 1;
        black.matchCount += 1;
        setPlayerList([...playerList]);
    }
    return (
        <Tabs defaultIndex={defaultTab}>
            {BackButton}
            <h2>{tourney.name}</h2>
            <TabList>
                <Tab>Players</Tab>
                <Tab>Scores</Tab>
                {roundList.map((round, id) =>
                    <Tab key={id}>Round {id + 1}</Tab>
                )}
            </TabList>
            <TabPanels>
            <TabPanel>
                <ul>
                {players.map((pId) =>
                    <li key={pId}>
                        {getPlayer(pId, playerList).firstName}&nbsp;
                        {getPlayer(pId, playerList).lastName}
                    </li>
                )}
                </ul>
            </TabPanel>
            <TabPanel>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Score</th>
                                {tbMethods.map((name, i) =>
                                    <th key={i}>{name}</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                        {standingTree.map((standings, rank) =>
                            standings.map((standing) =>
                                <tr key={standing.id}>
                                    <td>{rank + 1}</td>
                                    <td>
                                        {getPlayer(
                                            standing.id,
                                            playerList
                                        ).firstName}
                                    </td>
                                    <td>{standing.score}</td>
                                    {standing.tieBreaks.map((score, i) =>
                                        <td key={i}>
                                            {score}
                                        </td>
                                    )}
                                </tr>
                            )
                        )}
                        </tbody>
                    </table>
            </TabPanel>
            {roundList.map((matchList, id) =>
                <TabPanel key={id}>
                    <Round
                        matchList={matchList}
                        num={id}
                        roundList={roundList}
                        playerList={playerList}
                        setMatchResult={setMatchResult}/>
                </TabPanel>
            )}
            </TabPanels>
            <button onClick={() => newRound()}>New Round</button>
        </Tabs>
    );
}

function Round({matchList, roundList, num, playerList, setMatchResult}) {
    const [selectedMatch, setSelectedMatch] = useState(null);
    return (
        <PanelContainer>
            <Panel>
            <table className="table__roster">
                <caption>Round {num + 1} results</caption>
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
                    <tr key={pos}>
                        <td className="table__number row__id">{pos + 1}</td>
                        <td className="table__player row__player">
                            {getPlayer(match.players[0], playerList).firstName}
                            &nbsp;
                            {getPlayer(match.players[0], playerList).lastName}
                        </td>
                        <td className="data__input row__result">
                            <input
                                type="radio"
                                checked={match.result[0] === 1}
                                onChange={
                                    () => setMatchResult(num, pos, [1, 0])
                                }/>
                            <input
                                type="radio"
                                checked={match.result[0] === 0.5}
                                onChange={
                                    () => setMatchResult(num, pos, [0.5, 0.5])
                                }/>
                            <input
                                type="radio"
                                checked={match.result[1] === 1}
                                onChange={
                                    () => setMatchResult(num, pos, [0, 1])
                                }/>
                        </td>
                        <td className="table__player row__player">
                            {getPlayer(match.players[1], playerList).firstName}
                            &nbsp;
                            {getPlayer(match.players[1], playerList).lastName}
                        </td>
                        <td className="data__input row__controls">
                        {(
                        (selectedMatch !== pos)
                        ? <OpenButton action={() => setSelectedMatch(pos)} />
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
                <div>
                    <h2>Match info</h2>
                    <PlayerMatchInfo
                        match={matchList[selectedMatch]}
                        color={0}
                        playerData={scores.getPlayerMatchData(
                            matchList[selectedMatch].players[0],
                            roundList,
                            num
                        )}
                        playerList={playerList}/>
                    <PlayerMatchInfo
                        match={matchList[selectedMatch]}
                        color={1}
                        playerData={scores.getPlayerMatchData(
                            matchList[selectedMatch].players[1],
                            roundList,
                            num
                        )}
                        playerList={playerList} />
                </div>
            }
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
                ({numeral(match.origRating[color] - match.newRating[color]).format("+0")})
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
        </dl>
    );
}

// /**
//  *
//  * @param {Object} props
//  * @param {Tournament} props.tourney
//  */
// export function Standings({tourney}) {
//     return (
//       <table>
//         <caption>Current Standings</caption>
//         <thead>
//           <tr>
//             <th></th>
//             <th>First name</th>
//             <th>Score</th>
//             {tourney.tieBreak.filter((m) => m.active).map((method, i) =>
//                 <th key={i}>{method.name}</th>
//             )}
//           </tr>
//         </thead>
//         {scores.calcStandings(tourney).map((rank, i) =>
//           <tbody key={i}>
//             {rank.map((standing) =>
//               <tr key={standing.id}>
//                   <td>{i + 1}</td>
//                   <td>{standing.player.firstName}</td>
//                   <td className="table__number">{standing.scores.score}</td>
//                   {tourney.tieBreak.filter((m) => m.active).map((method, i) =>
//                       <td className="table__number" key={i}>
//                           {standing.scores[method.name]}
//                       </td>
//                   )}
//               </tr>
//               )}
//           </tbody>
//         )}
//       </table>
//     );
// }
