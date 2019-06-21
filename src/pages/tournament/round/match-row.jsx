import "@reach/dialog/styles.css";
import {BLACK, DUMMY_ID, WHITE} from "../../../data-types";
import {Panel, PanelContainer} from "../../../components/utility";
import React, {useState} from "react";
import {Dialog} from "@reach/dialog";
import Hidden from "@reach/visually-hidden";
import Icons from "../../../components/icons";
import PlayerMatchInfo from "./player-match-info";
import PropTypes from "prop-types";
import VisuallyHidden from "@reach/visually-hidden";
import {ratings} from "../../../pairing-scoring";
import styles from "./round.module.css";
import {sum} from "ramda";

export default function MatchRow({
    compact,
    pos,
    match,
    roundId,
    selectedMatch,
    setSelectedMatch,
    scoreData,
    tournament
}) {
    const {
        tourney,
        tourneyDispatch,
        players,
        getPlayer,
        playersDispatch
    } = tournament;
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
    const whitePlayer = getPlayer(match.playerIds[WHITE]);
    const blackPlayer = getPlayer(match.playerIds[BLACK]);
    const whiteName = whitePlayer.firstName + " " + whitePlayer.lastName;
    const blackName = blackPlayer.firstName + " " + blackPlayer.lastName;

    function ResultDisplay(color) {
        if (resultCode === "NOTSET") {
            return <VisuallyHidden>Not set</VisuallyHidden>;
        } else if (resultCode === "DRAW") {
            // return <Icons.Minus aria-label="Draw" />;
            // TODO: find a better icon for draws.
            return (
                <span
                    aria-label="Draw"
                    role="img"
                    style={{filter: "grayscale(100%)"}}
                >
                    🤝
                </span>
            );
        } else if (resultCode === color) {
            return <Icons.Award  aria-label="Won" />;
        } else {
            return <VisuallyHidden>Lost</VisuallyHidden>;
        }
    }

    function setMatchResult(event) {
        const result = (function () {
            switch (event.target.value) {
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
        if (result === resultCode) {
            // if it hasn't changed, then do nothing
            return;
        }
        const white = players[match.playerIds[WHITE]];
        const black = players[match.playerIds[BLACK]];
        const newRating = (
            event.currentTarget.value === "NOTSET"
            ? match.origRating
            : ratings.calcNewRatings(
                match.origRating,
                [white.matchCount, black.matchCount],
                result
            )
        );
        playersDispatch({
            id: white.id,
            rating: newRating[WHITE],
            type: "SET_PLAYER_RATING"
        });
        playersDispatch({
            id: black.id,
            rating: newRating[BLACK],
            type: "SET_PLAYER_RATING"
        });
        // if the result hasn't been scored yet, increment the matchCount
        if (sum(match.result) === 0) {
            playersDispatch({
                id: white.id,
                matchCount: white.matchCount + 1,
                type: "SET_PLAYER_MATCHCOUNT"
            });
            playersDispatch({
                id: black.id,
                matchCount: black.matchCount + 1,
                type: "SET_PLAYER_MATCHCOUNT"
            });
        }
        tourneyDispatch({
            matchId: match.id,
            newRating,
            result,
            roundId,
            type: "SET_MATCH_RESULT"
        });
    }

    return (
        <tr
            className={
                match.id === selectedMatch
                ? "selected"
                : "buttons-on-hover"
            }
        >
            <th className={"table__number " + styles.rowId} scope="row">
                {pos + 1}
            </th>
            <td className={styles.playerResult}>
                {ResultDisplay("WHITE")}
            </td>
            <td
                className={"table__player row__player " + whitePlayer.type}
                data-testid={`match-${pos}-white`}
            >
                {whiteName}
            </td>
            <td className={styles.playerResult}>
                {ResultDisplay("BLACK")}
            </td>
            <td
                className={"table__player row__player " + blackPlayer.type}
                data-testid={`match-${pos}-black`}
            >
                {blackName}
            </td>
            <td className={styles.matchResult + " data__input row__controls"}>
                <select
                    className={styles.winnerSelect}
                    disabled={match.playerIds.includes(DUMMY_ID)}
                    value={resultCode}
                    onBlur={setMatchResult}
                    onChange={setMatchResult}
                >
                    <option value="NOTSET">
                        Select winner
                    </option>
                    <option value="WHITE">
                        White won
                    </option>
                    <option value="BLACK">
                        Black won
                    </option>
                    <option value="DRAW">
                        Draw
                    </option>
                </select>
            </td>
            {!compact &&
                <td className={styles.controls + " data__input"}>
                    {selectedMatch !== match.id
                    ? (
                        <button
                            className="button-ghost"
                            title="Edit match"
                            onClick={() => setSelectedMatch(match.id)}
                        >
                            <Icons.Circle />
                            <VisuallyHidden>
                                Edit match for {whiteName} versus {blackName}
                            </VisuallyHidden>
                        </button>
                    ) : (
                        <button
                            className="button-ghost button-pressed"
                            title="End editing match"
                            onClick={() => setSelectedMatch(null)}
                        >
                            <Icons.CheckCircle />
                        </button>
                    )}
                    <button
                        className="button-ghost"
                        title="Open match information."
                        onClick={() => setOpenModal(true)}
                    >
                        <Icons.Info />
                        <Hidden>
                            View information for match:{" "}
                            {whiteName} versus {blackName}
                        </Hidden>
                    </button>
                    <Dialog
                        isOpen={openModal}
                        onDismiss={() => setOpenModal(false)}
                    >
                        <button
                            className="button-micro button-primary"
                            onClick={() => setOpenModal(false)}
                        >
                            close
                        </button>
                        <p>{tourney.name}</p>
                        <p>Round {roundId + 1}, match {pos + 1}</p>
                        <PanelContainer>
                            <Panel>
                                <PlayerMatchInfo
                                    color={WHITE}
                                    match={match}
                                    getPlayer={getPlayer}
                                    scoreData={scoreData}
                                />
                            </Panel>
                            <Panel>
                                <PlayerMatchInfo
                                    color={BLACK}
                                    match={match}
                                    getPlayer={getPlayer}
                                    scoreData={scoreData}
                                />
                            </Panel>
                        </PanelContainer>
                    </Dialog>
                </td>
            }
        </tr>
    );
}
MatchRow.propTypes = {
    compact: PropTypes.bool,
    match: PropTypes.object.isRequired,
    pos: PropTypes.number.isRequired,
    roundId: PropTypes.number.isRequired,
    scoreData: PropTypes.object,
    selectedMatch: PropTypes.string,
    setSelectedMatch: PropTypes.func,
    tournament: PropTypes.object.isRequired
};
