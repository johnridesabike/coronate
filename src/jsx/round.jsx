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
    /** @param {number} id */
    function rmMatch(id) {
        round.removeMatch(id);
        setMatches(round.matches);
    }
    useEffect(function () {
        round.matches = matches;
        setUnmatched(round.getUnmatchedPlayers());
        setMatchResults(fetchResults());
    }, [matches]);
    useEffect(function () {
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
    // react-movable stuff
    const optionItems = matches.map((match, i) => (
        {
            match: match,
            pos: i,
            rmMatch: rmMatch,
            white: match.getWhiteInfo(),
            black: match.getBlackInfo(),
            result: match.result
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
                <th className="row__id">#</th>
                <th className="row__player">White</th>
                <th className="row__result">Result</th>
                <th className="row__player">Black</th>
                <th className="row__controls"></th>
            </tr>
            </thead>
            <tbody {...props}>
            {children}
            </tbody>
        </table>
    );
    // @ts-ignore
    function renderItem ({value, props, isDragged, isSelected}) {
        const row = (
            <tr {...props} className={value.match.isBye() ? "inactive" : ""}>
                <td className="table__number row__id">
                    {isDragged ? "" : value.pos + 1}
                </td>
                <td className="table__player row__player">
                    {value.white.player.firstName} {value.white.player.lastName}
                </td>
                <td className="data__input row__result">
                    <input
                    type="radio"
                    checked={value.result[0] === 1}
                    disabled={value.match.isBye()}
                    onChange={() => updateResult(value.match, [1,0])}
                    />
                    <input
                        type="radio"
                        checked={value.result[0] === 0.5}
                        disabled={value.match.isBye()}
                        onChange={() => updateResult(value.match, [0.5, 0.5])}
                        />
                    <input
                        type="radio"
                        checked={value.result[1] === 1}
                        disabled={value.match.isBye()}
                        onChange={() => updateResult(value.match, [0, 1])}
                        />
                </td>
                <td className="table__player row__player">
                    {value.black.player.firstName} {value.black.player.lastName}
                </td>
                <td className="data__input row__controls">
                    <button onClick={() => toggleOpenMatch(value.match)}>
                        ?
                    </button>
                    <button data-movable-handle>
                        <DragIcon isDragged={isDragged} />
                    </button>
                </td>
            </tr>
        );
        return (
            (isDragged)
             ? (
                <table className="table__roster">
                    <tbody>
                        {row}
                    </tbody>
                </table>
                )
            : row
        );
    };
    return (
        <Fragment>
            <List
                values={optionItems}
                onChange={moveOption}
                renderList={renderList}
                renderItem={renderItem}
            />
            {openMatch && <MatchInfo match={openMatch} />}
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