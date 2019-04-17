// @ts-check
import React, {useState, useEffect, Fragment} from "react";
import {scores} from "../chess-tourney";
import numeral from "numeral";
import "../round.css";
import {DragIcon} from "./utility";
import {List, arrayMove} from "react-movable";
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

// /**
//  * @param {Object} props
//  * @param {Tournament} props.tourney
//  * @param {React.Dispatch<React.SetStateAction<Round[]>>} props.setRoundList
//  */
// function NewRound({tourney, setRoundList}) {
//     const makeRound = function () {
//         const round = tourney.newRound();
//         round.autoPair();
//         setRoundList([...tourney.roundList]);
//     };
//     if (tourney.isNewRoundReady()) {
//         return (
//             <button
//                 onClick={makeRound}>
//                 Make new round
//             </button>);
//     } else {
//         return <p>Complete the last round first.</p>;
//     }
// }

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
    /** @type {[number[], React.Dispatch<React.SetStateAction<number[]>>]} */
    const [toPair, setToPair] = useState([]);
    function delRound() {
        tourney.removeRound(round);
        setRoundList([...tourney.roundList]);
    };
    function autoPair() {
        round.autoPair();
        setMatches(round.matches);
        setUnmatched(round.getUnmatchedPlayers());
    }
    function pairChecked() {
        round.setPair(toPair[0], toPair[1]);
        setMatches(round.matches);
        setUnmatched(round.getUnmatchedPlayers());
        setToPair([]);
    }
    /** @param {number} id */
    function rmMatch(id) {
        round.removeMatch(id);
        setMatches(round.matches);
        setUnmatched(round.getUnmatchedPlayers());
    }
    useEffect(function () {
        round.matches = matches;
    }, [matches]);
    // react-movable stuff
    const optionItems = matches.map((match, i) => (
        {
            match: match,
            pos: i,
            rmMatch: rmMatch,
            setCanMakeNewRound: setCanMakeNewRound
        }
    ));
    // @ts-ignore
    function moveOption({oldIndex, newIndex}) {
        setMatches((prevState) => arrayMove(prevState, oldIndex, newIndex));
    };
    // @ts-ignore
    const renderList = ({children, props, isDragged}) => (
        <table className="table__roster">
            <caption>Round {round.id + 1} results</caption>
            <thead>
            <tr>
                <th>#</th>
                <th colSpan={2}>White</th>
                <th>Draw</th>
                <th colSpan={2}>Black</th>
                <th colSpan={2}></th>
            </tr>
            </thead>
            <tbody>
            {children}
            </tbody>
        </table>
    );
    // @ts-ignore
    const renderItem = ({value, props, isDragged, isSelected}) => (
        <tr {...props}>
            <RoundMatch pos={value.pos} match={value.match}
                rmMatch={value.rmMatch} isDragged={isDragged}
                setCanMakeNewRound={value.setCanMakeNewRound}/>
        </tr>
    );
    return (
        <Fragment>
            <List
                values={optionItems}
                onChange={moveOption}
                renderList={renderList}
                renderItem={renderItem}
            />
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
        </Fragment>
    );
}

/**
 *
 * @param {Object} props
 * @param {Match} props.match
 * @param {function} props.rmMatch
 * @param {number} props.pos
 * @param {boolean} props.isDragged
 * @param {React.Dispatch<React.SetStateAction<boolean>>} props.setCanMakeNewRound
 */
function RoundMatch({match, pos, isDragged, rmMatch, setCanMakeNewRound}) {
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
        setCanMakeNewRound(round.isComplete());
    }, [result]);
    return (
        <Fragment>
            {/* <tr className={(
                (match.isBye())
                ? "inactive"
                : "")}> */}
                <td className="table__number">{pos + 1}</td>
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
                <td>
                    <button onClick={() => rmMatch(match.id)}>
                        x
                    </button>
                </td>
                <td>
                    <button>
                        <DragIcon isDragged={isDragged} />
                    </button>
                </td>
            {/* </tr> */}
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
                        Match ideal: {numeral(match.ideal).format("0%")}
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