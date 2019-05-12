import React from "react";
// This will cause Webpack to import the entire Ramda library, but we're using
// so much of it that cherry-picking individual files has virtually no benefit.
import {
    __,
    append,
    concat,
    last,
    lensPath,
    filter,
    findIndex,
    move,
    over,
    propEq,
    remove,
    reverse,
    set
} from "ramda";
import {getPlayerById} from "../data/player";
import defaultTourneyList from "./demo-tourney.json";
import {autoPair, manualPair} from "./match-functions";
/**
 * @typedef {import("./dispatch").Action} Action
 * @typedef {import("../data/index").Tournament} Tournament
 */

/** @type {Tournament[]} */
// @ts-ignore
const defaultData = defaultTourneyList;

/**
 * @param {Tournament[]} state
 * @param {Action} action
 * @returns {Tournament[]}
 */
function tourneysReducer(state, action) {
    switch (action.type) {
    case "ADD_TOURNEY":
        return append(action.tourney, state);
    case "DEL_TOURNEY":
        return state.filter((ignore, i) => i !== action.index);
    case "ADD_ROUND":
        return over(
            lensPath([action.tourneyId, "roundList"]),
            append([]),
            state
        );
    case "DEL_LAST_ROUND":
        // If a match has been scored, then reset it.
        // TODO: This logic should probably be somewhere else?
        last(
            state[action.tourneyId].roundList
        ).forEach(
            function (match) {
                if (match.result[0] + match.result[1] !== 0) {
                    match.players.forEach(
                        function (pId, color) {
                            getPlayerById(action.players, pId).matchCount -= 1;
                            getPlayerById(action.players, pId).rating = (
                                match.origRating[color]
                            );
                        }
                    );
                }
            }
        );
        return over(
            lensPath([action.tourneyId, "roundList"]),
            remove(-1, 1),
            state
        );
    case "ADD_TIEBREAK":
        return over(
            lensPath([action.tourneyId, "tieBreaks"]),
            append(action.id),
            state
        );
    case "DEL_TIEBREAK":
        return over(
            lensPath([action.tourneyId, "tieBreaks"]),
            filter((id) => id !== action.id),
            state
        );
    case "MOVE_TIEBREAK":
        return over(
            lensPath([action.tourneyId, "tieBreaks"]),
            move(action.oldIndex, action.newIndex),
            state
        );
    case "SET_TOURNEY_PLAYERS":
        return set(
            lensPath([action.tourneyId, "players"]),
            action.players,
            state
        );
    case "SET_BYE_QUEUE":
        return set(
            lensPath([action.tourneyId, "byeQueue"]),
            action.byeQueue,
            state
        );
    case "AUTO_PAIR":
        return over(
            lensPath([action.tourneyId, "roundList", action.roundId]),
            concat(
                // @ts-ignore
                __,
                autoPair(
                    state[action.tourneyId],
                    action.playerState,
                    action.roundId,
                    action.unpairedPlayers,
                    action.byeValue
                )
            ),
            state
        );
    case "MANUAL_PAIR":
        return over(
            lensPath([action.tourneyId, "roundList", action.roundId]),
            append(manualPair(action.players, action.pair, action.byeValue)),
            state
        );
    case "SET_MATCH_RESULT":
        return set(
            lensPath([
                action.tourneyId,
                "roundList",
                action.roundId,
                findIndex(
                    propEq("id", action.matchId),
                    state[action.tourneyId].roundList[action.roundId]),
                "result"
            ]),
            action.result,
            set(
                lensPath([
                    action.tourneyId,
                    "roundList",
                    action.roundId,
                    findIndex(
                        propEq("id", action.matchId),
                        state[action.tourneyId].roundList[action.roundId]),
                    "newRating"
                ]),
                action.newRating,
                state
            )
        );
    case "DEL_MATCH":
        return over(
            lensPath([action.tourneyId, "roundList", action.roundId]),
            filter((match) => match.id !== action.matchId),
            state
        );
    case "SWAP_COLORS":
        return over(
            lensPath([
                action.tourneyId,
                "roundList",
                action.roundId,
                findIndex(
                    propEq("id", action.matchId),
                    state[action.tourneyId].roundList[action.roundId]
                )
            ]),
            (match) => ({
                ...match,
                players: reverse(match.players),
                origRating: reverse(match.origRating),
                newRating: reverse(match.newRating)
            }),
            state
        );
    case "MOVE_MATCH":
        return over(
            lensPath([action.tourneyId, "roundList", action.roundId]),
            move(action.oldIndex, action.newIndex),
            state
        );
    default:
        throw new Error("Unexpected action type " + action.type);
    }
}

/** @type {[Tournament[], React.Dispatch<Action>]} */
const defaultContext = null;
const TournamentContext = React.createContext(defaultContext);

function useTournamentReducer() {
    return React.useReducer(tourneysReducer, defaultData);
}

/**
 * @param {number} [tourneyId]
 * @return {[Tournament, React.Dispatch<Action>]}
 */
export function useTournament(tourneyId) {
    const [tourneys, dispatch] = React.useContext(TournamentContext);
    return [tourneys[tourneyId], dispatch];
}

export function useTournaments() {
    return React.useContext(TournamentContext);
}

/**
 * @param {Object} props
 */
export function TournamentProvider(props) {
    const [data, dispatch] = useTournamentReducer();
    return (
        <TournamentContext.Provider value={[data, dispatch]}>
            {props.children}
        </TournamentContext.Provider>
    );
}
