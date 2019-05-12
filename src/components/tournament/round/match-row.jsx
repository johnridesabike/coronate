import React from "react";
import {Link} from "@reach/router";
import curry from "ramda/src/curry";
import More from "react-feather/dist/icons/more-horizontal";
import Close from "react-feather/dist/icons/x";
import {getPlayerById, calcNewRatings, dummyPlayer} from "../../../data/player";
import {BLACK, WHITE} from "../../../data/constants";
import {useTournaments} from "../../../state/tourneys-state";
import {usePlayers} from "../../../state/player-state";
// @ts-ignore
import {winnerSelect} from "./round.module.css";

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
    // @ts-ignore
    // eslint-disable-next-line no-unused-vars
    const [ignore, dispatch] = useTournaments();
    const {playerState, playerDispatch} = usePlayers();
    const getPlayer = curry(getPlayerById)(playerState.players);
    /** @type {string} */
    let resultCode;
    if (match.result[0] > match.result[1]) {
        resultCode = "WHITE";
    } else if (match.result[1] > match.result[0]) {
        resultCode = "BLACK";
    } else if (match.result.every((x) => x === 0.5)) {
        resultCode = "DRAW";
    } else {
        resultCode = "NOTSET";
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
        case "NOTSET":
            result = [0, 0];
            break;
        default:
            throw new Error();
        }
        const white = getPlayer(match.players[WHITE]);
        const black = getPlayer(match.players[BLACK]);
        const newRating = (
            (event.currentTarget.value === "NOTSET")
            ? match.origRating
            : calcNewRatings(
                match.origRating,
                [white.matchCount, black.matchCount],
                result
            )
        );
        playerDispatch({
            type: "SET_PLAYER_RATING",
            id: white.id,
            rating: newRating[WHITE]
        });
        playerDispatch({
            type: "SET_PLAYER_RATING",
            id: black.id,
            rating: newRating[BLACK]
        });
        // if the result hasn't been scored yet, increment the matchCount
        if (match.result.reduce((a, b) => a + b) === 0) {
            playerDispatch({
                type: "SET_PLAYER_MATCHCOUNT",
                id: white.id,
                matchCount: white.matchCount + 1
            });
            playerDispatch({
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
                <Link to={"/players/" + match.players[0]}>
                    {whiteName}
                </Link>{" "}
                {resultCode === "WHITE" && (
                    <span role="img" aria-label="Winner">
                        🏆
                    </span>
                )}
            </td>
            <td
                className="table__player row__player"
                data-testid={`match-${pos}-black`}
            >
                <Link to={"/players/" + match.players[1]}>
                    {blackName}
                </Link>{" "}
                {resultCode === "BLACK" && (
                    <span role="img" aria-label="Winner">
                        🏆
                    </span>
                )}
            </td>
            <td className="data__input row__controls">
                <select
                    onBlur={setMatchResult}
                    onChange={setMatchResult}
                    disabled={match.players.includes(dummyPlayer.id)}
                    defaultValue={resultCode}
                    className={winnerSelect}
                >
                    <option value="NOTSET">
                        Select a winner
                    </option>
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
            </td>
            <td className="data__input row__controls">
                {(selectedMatch !== match.id)
                ? (
                    <button
                        className="iconButton"
                        title={
                            // eslint-disable-next-line max-len
                            `Open information for ${whiteName} versus ${blackName}.`
                        }
                        aria-label={
                            // eslint-disable-next-line max-len
                            `Open information for ${whiteName} versus ${blackName}.`
                        }
                        onClick={() => setSelectedMatch(match.id)}
                    >
                        <More />
                    </button>
                ) : (
                    <button
                        title="Close information."
                        aria-label="Close information."
                        onClick={() => setSelectedMatch(null)}
                    >
                        <Close/>
                    </button>
                )}
            </td>
        </tr>
    );
}
