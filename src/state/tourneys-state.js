import {createContext, createElement, useContext, useReducer} from "react";
// This will cause Webpack to import the entire Ramda library, but we're using
// so much of it that cherry-picking individual files has virtually no benefit.
import {
    __,
    append,
    concat,
    difference,
    last,
    lensPath,
    mergeRight,
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
import {createTournament} from "../data/factories";
import {DUMMY_ID} from "../data/constants";
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
        return append(createTournament({name: action.name}), state);
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
                            if (pId === DUMMY_ID) {
                                return; // don't try to set the dummy
                            }
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
                    state[action.tourneyId].roundList[action.roundId]
                ),
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
                        state[action.tourneyId].roundList[action.roundId]
                    ),
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
            (match) => mergeRight(
                match,
                {
                    result: reverse(match.result),
                    players: reverse(match.players),
                    origRating: reverse(match.origRating),
                    newRating: reverse(match.newRating)
                }
            ),
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
const TournamentContext = createContext(defaultContext);

export function useTournaments() {
    return useContext(TournamentContext);
}

/**
 * @param {number} [tourneyId]
 * @returns {[Tournament, React.Dispatch<Action>]}
 */
export function useTournament(tourneyId) {
    const [tourneys, dispatch] = useContext(TournamentContext);
    return [tourneys[tourneyId], dispatch];
}

/**
 * @param {number} tourneyId
 * @param {number} roundId
 */
export function useRound(tourneyId, roundId) {
    const [tourney, dispatch] = useTournament(tourneyId);
    const matchList = tourney.roundList[roundId];
    const matched = matchList.reduce(
        (acc, match) => acc.concat(match.players),
        []
    );
    const unmatched = difference(tourney.players, matched);
    return {tourney, dispatch, unmatched, matchList};
}

/**
 * @param {Object} props
 */
export function TournamentProvider(props) {
    const [state, dispatch] = useReducer(tourneysReducer, defaultData);
    return (
        createElement(
            TournamentContext.Provider,
            {value: [state, dispatch]},
            props.children
        )
    );
}
