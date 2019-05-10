import React, {useContext} from "react";
import VisuallyHidden from "@reach/visually-hidden";
import curry from "ramda/src/curry";
import More from "react-feather/dist/icons/more-horizontal";
import Close from "react-feather/dist/icons/x";
import {getPlayerById, calcNewRatings, dummyPlayer} from "../../../data/player";
import {BLACK, WHITE} from "../../../data/constants";
import {getById} from "../../../data/utility";
import {DataContext} from "../../../state/global-state";

/**
 * @typedef {import("../../../data").Match} Match
 */

/**
 * @param {Object} props
 * @param {number} props.pos
 * @param {Match} props.match
 * @param {number} props.tourneyId
 * @param {number} props.roundId
 * @param {string} props.selectedMatch
 * @param {React.Dispatch<React.SetStateAction<string>>} props.setSelectedMatch
 */
export default function MatchRow({
    pos,
    match,
    tourneyId,
    roundId,
    selectedMatch,
    setSelectedMatch
}) {
    const {data, dispatch} = useContext(DataContext);
    const tourney = data.tourneys[tourneyId];
    const getPlayer = curry(getPlayerById)(data.players);
    const isWhiteWinner = match.result[0] > match.result[1];
    const isBlackWinner = match.result[1] > match.result[0];
    const isDraw = match.result.every((x) => x === 0.5);
    /** @type {string} */
    let resultCode;
    if (isWhiteWinner) {
        resultCode = "WHITE";
    } else if (isBlackWinner) {
        resultCode = "BLACK";
    } else {
        resultCode = "DRAW";
    }
    const whiteName = (
        getPlayer(match.players[0]).firstName
        + " "
        + getPlayer(match.players[0]).lastName
    );
    const blackName = (
        getPlayer(match.players[1]).firstName
        + " "
        + getPlayer(match.players[1]).lastName
    );

    /**
     * @param {React.FocusEvent<HTMLSelectElement>} event
     */
    function setMatchResult(event) {
        console.log(event.currentTarget.value);
        /** @type {[number, number]} */
        let result;
        switch (event.currentTarget.value) {
        case "WHITE":
            result = [1, 0];
            break;
        case "BLACK":
            result = [0, 1];
            break;
        case "DRAW":
            result = [0.5, 0.5];
            break;
        default:
            throw new Error();
        }
        const theMatch = getById(tourney.roundList[roundId], match.id);
        const white = getPlayer(theMatch.players[WHITE]);
        const black = getPlayer(theMatch.players[BLACK]);
        const newRating = calcNewRatings(
            theMatch.origRating,
            [white.matchCount, black.matchCount],
            result
        );
        dispatch({
            type: "SET_PLAYER_RATING",
            id: white.id,
            rating: newRating[WHITE]
        });
        dispatch({
            type: "SET_PLAYER_RATING",
            id: black.id,
            rating: newRating[BLACK]
        });
        // if the result hasn't been scored yet, increment the matchCount
        if (theMatch.result.reduce((a, b) => a + b) === 0) {
            dispatch({
                type: "SET_PLAYER_MATCHCOUNT",
                id: white.id,
                matchCount: white.matchCount + 1
            });
            dispatch({
                type: "SET_PLAYER_MATCHCOUNT",
                id: black.id,
                matchCount: black.matchCount + 1
            });
        }
        dispatch({
            type: "SET_MATCH_RESULT",
            tourneyId,
            roundId,
            matchId: match.id,
            result,
            newRating
        });
    }
    return (
        <tr>
            <th className="table__number row__id" scope="row">{pos + 1}</th>
            <td
                className="table__player row__player"
                data-testid={`match-${pos}-white`}
            >
                {whiteName}{" "}
                {isWhiteWinner && (
                    <span role="img" aria-label="Winner">
                        🏆
                    </span>
                )}
            </td>
            <td
                className="table__player row__player"
                data-testid={`match-${pos}-black`}
            >
                {blackName}{" "}
                {isBlackWinner && (
                    <span role="img" aria-label="Winner">
                        🏆
                    </span>
                )}
            </td>
            <td className="row__result">
                {isWhiteWinner && "White won"}
                {isBlackWinner && "Black won"}
                {isDraw && "Draw"}
            </td>
            <td className="data__input row__controls">
                <select
                    onBlur={setMatchResult}
                    disabled={match.players.includes(dummyPlayer.id)}
                    defaultValue={resultCode}
                >
                    <option value="WHITE">
                        {whiteName} won
                    </option>
                    <option value="BLACK">
                        {blackName} won
                    </option>
                    <option value="DRAW">
                        Draw
                    </option>
                </select>
                {(selectedMatch !== match.id)
                ?
                    <button onClick={() => setSelectedMatch(match.id)}>
                        <More />
                        <VisuallyHidden>
                            More information and options for {whiteName} versus
                            {" "}{blackName}
                        </VisuallyHidden>
                    </button>
                :
                    <button onClick={() => setSelectedMatch(null)}>
                        <Close/>
                        <VisuallyHidden>Close information.</VisuallyHidden>
                    </button>
                }
            </td>
        </tr>
    );
}
