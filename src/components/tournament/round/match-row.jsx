import React, {useState} from "react";
import {Dialog} from "@reach/dialog";
import Hidden from "@reach/visually-hidden";
import Edit from "react-feather/dist/icons/edit";
import Info from "react-feather/dist/icons/info";
import Check from "react-feather/dist/icons/check";
import {PanelContainer, Panel} from "../../utility";
import {calcNewRatings} from "../../../pairing-scoring/scoring";
import {BLACK, WHITE, DUMMY_ID} from "../../../pairing-scoring/constants";
import {useRound, usePlayers} from "../../../state";
import PlayerMatchInfo from "./player-match-info";
// @ts-ignore
import {winnerSelect} from "./round.module.css";
import "@reach/dialog/styles.css";

/**
 * @typedef {import("../../../factory-types").Match} Match
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
    const {tourney, dispatch} = useRound(tourneyId, roundId);
    const {playerDispatch, getPlayer} = usePlayers();
    const [openModal, setOpenModal] = useState(false);
    const resultCode = (function () {
        if (match.result[0] > match.result[1]) {
            return "WHITE";
        } else if (match.result[1] > match.result[0]) {
            return "BLACK";
        } else if (match.result.every((x) => x === 0.5)) {
            return "DRAW";
        } else {
            return "NOTSET";
        }
    }());
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
        const result = (function () {
            switch (event.currentTarget.value) {
            case "WHITE":
                return [1, 0];
            case "BLACK":
                return [0, 1];
            case "DRAW":
                return [0.5, 0.5];
            case "NOTSET":
                return [0, 0];
            default:
                throw new Error();
            }
        }());
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
        <tr className={match.id === selectedMatch ? "selected" : ""}>
            <th className="table__number row__id" scope="row">{pos + 1}</th>
            <td
                className="table__player row__player"
                data-testid={`match-${pos}-white`}
            >
                {whiteName}{" "}
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
                {blackName}{" "}
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
                    disabled={match.players.includes(DUMMY_ID)}
                    value={resultCode}
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
                        onClick={() => setSelectedMatch(match.id)}
                        title="Edit match"
                    >
                        <Edit />
                    </button>
                ) : (
                    <button
                        className="iconButton"
                        onClick={() => setSelectedMatch(null)}
                        title="End editing match"
                    >
                        <Check />
                    </button>
                )}
                <button
                    className="iconButton"
                    onClick={() => setOpenModal(true)}
                    title="Open match information."
                >
                    <Info />
                    <Hidden>
                        View information for match:{" "}
                        {whiteName} versus {blackName}
                    </Hidden>
                </button>
                <Dialog isOpen={openModal}>
                    <button onClick={() => setOpenModal(false)}>
                        close
                    </button>
                    <p>{tourney.name}</p>
                    <p>Round {roundId + 1}, match {pos + 1}</p>
                    <PanelContainer>
                        <Panel>
                            <PlayerMatchInfo
                                matchId={match.id}
                                color={0}
                                tourneyId={tourneyId}
                                roundId={roundId}
                            />
                        </Panel>
                        <Panel>
                            <PlayerMatchInfo
                                matchId={match.id}
                                color={1}
                                tourneyId={tourneyId}
                                roundId={roundId}
                            />
                        </Panel>
                    </PanelContainer>
                </Dialog>
            </td>
        </tr>
    );
}
