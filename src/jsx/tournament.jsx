// @ts-check
import React, {useState} from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import numeral from "numeral";
import "react-tabs/style/react-tabs.css";


// export function TournamentList({
//     playerManager,
//     tourneyList,
//     setTourneyList,
//     openTourney,
//     setOpenTourney
// }) {
//     const newTourneyDefaults = {name: "The most epic tournament"};
//     const [newTourneyData, setNewTourneyData] = useState(newTourneyDefaults);
//     /** @param {React.FormEvent<HTMLFormElement>} event */
//     const newTourney = function(event) {
//         event.preventDefault();
//         let tourney = createTournament({players: playerManager});
//         tourney.name = newTourneyData.name;
//         tourney.id = tourneyList.length;
//         let newTList = [tourney];
//         setTourneyList(newTList.concat(tourneyList));
//         setNewTourneyData(newTourneyDefaults);
//         setOpenTourney(tourney);
//     };
//     /** @param {React.ChangeEvent<HTMLInputElement>} event */
//     const updateField = function (event) {
//         /** @type {Object<string, string>} */
//         const update = {};
//         update[event.target.name] = event.target.value;
//         setNewTourneyData(Object.assign({}, newTourneyData, update));
//     };
//     /** @param {number} id */
//     const selectTourney = function (id) {
//         setOpenTourney(tourneyList[id]);
//     };
//     let content = <Fragment></Fragment>;
//     if (openTourney) {
//         content =
//         <TournamentFrame
//             key={openTourney.id}
//             tourney={openTourney}
//             playerManager={playerManager}
//             setOpenTourney={setOpenTourney} />;
//     } else {
//         content =
//         <Fragment>
//             {(tourneyList.length > 0)
//             ?
//                 <ol>
//                     {tourneyList.map((tourney, i) =>
//                         <li key={i} tabIndex={0} role="menuitem"
//                             onClick={() => selectTourney(i)}
//                             onKeyPress={() => selectTourney(i)}>
//                             {tourney.name}
//                         </li>
//                     )}
//                 </ol>
//             :
//                 <p>
//                     No tournaments added yet.
//                 </p>
//             }
//             <form onSubmit={newTourney}>
//                 <input type="text" name="name" value={newTourneyData.name}
//                     onChange={updateField} required />
//                 <input type="submit" value="New Tournament" />
//             </form>
//         </Fragment>;
//     }
//     return (
//         <main>
//             {content}
//         </main>
//     );
// }

import demoTourney from "../demo-tourney.json";
import {getPlayer} from "../chess-tourney-v2/player-manager";
import scores from "../chess-tourney-v2/scores";
import demoTieBreaks from "../demo-tiebreak.json";
import {OpenButton, PanelContainer, Panel, BackButton} from "./utility";
/**
 *
 * @param {Object} props
 */
export function TournamentTabs({playerList}) {
    const players = demoTourney.players;
    const roundList = demoTourney.roundList;
    const tieBreaks = demoTieBreaks.filter((m) => m.active);
    return (
        <Tabs>
            <h2>{demoTourney.name}</h2>
            <TabList>
                <Tab>Players</Tab>
                <Tab>Scores</Tab>
                {roundList.map((round, id) =>
                    <Tab key={id}>Round {id + 1}</Tab>
                )}
            </TabList>
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
                                {tieBreaks.map((m) =>
                                    <th key={m.id}>{m.name}</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                        {scores.calcStandings(roundList).map((standings, rank) =>
                            standings.map((standing) =>
                                <tr key={standing.id}>
                                    <td>{rank + 1}</td>
                                    <td>{getPlayer(standing.id, playerList).firstName}</td>
                                    <td>{standing.scores.score}</td>
                                    {tieBreaks.map((m, i) =>
                                        <td key={i}>
                                            {standing.scores[m.id]}
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
                        playerList={playerList}/>
                </TabPanel>
            )}
        </Tabs>
    );
}

function Round({matchList, num, playerList}) {
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
                                readOnly/>
                            <input
                                type="radio"
                                checked={match.result[0] === 0.5}
                                readOnly/>
                            <input
                                type="radio"
                                checked={match.result[1] === 1}
                                readOnly/>
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
                        player={getPlayer(matchList[selectedMatch].players[0], playerList)} />
                    <PlayerMatchInfo
                        match={matchList[selectedMatch]}
                        color={1}
                        player={getPlayer(matchList[selectedMatch].players[1], playerList)} />
                </div>
            }
            </Panel>
        </PanelContainer>
    );
}

function PlayerMatchInfo({match, color, player}) {
    return (
        <dl className="player-card">
            <h3>{player.firstName} {player.lastName}</h3>
            <dt>Score</dt>
            <dd>{player.score}</dd>
            <dt>Rating</dt>
            <dd>
                {match.origRating[color]}
                &nbsp;
                ({numeral(match.origRating[color] - match.origRating[color]).format("+0")})
            </dd>
            {/* <dt>Color balance</dt>
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
            </dd> */}
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
