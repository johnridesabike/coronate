import {Player, createTournament} from "../data-types";
import {
    __,
    append,
    concat,
    difference,
    filter,
    findIndex,
    lensPath,
    mergeRight,
    move,
    over,
    propEq,
    remove,
    reverse,
    set
} from "ramda";
import {autoPair, manualPair} from "./match-functions";
import {
    createContext,
    createElement,
    useContext,
    useEffect,
    useReducer
} from "react";
import defaultTourneyList from "./demo-tourney.json";
import {localStorageOrDefault} from "./helpers";
import t from "tcomb";

const ActionAddTourney = t.interface({
    name: t.String
});
const ActionDelTourney = t.interface({
    index: t.Number
});
const ActionAddRound = t.interface({
    tourneyId: t.Number
});
const ActionDelLastRound = t.interface({
    players: t.list(Player),
    tourneyId: t.Number
});
const ActionAddRemoveTieBreak = t.interface({
    id: t.Number,
    tourneyId: t.Number
});
const ActionMoveTieBreak = t.interface({
    newIndex: t.Number,
    oldIndex: t.Number,
    tourneyId: t.Number
});
const ActionSetTourneyPlayers = t.interface({
    players: t.list(t.Number),
    tourneyId: t.Number
});
const ActionSetByeQueue = t.interface({
    byeQueue: t.list(t.Number),
    tourneyId: t.Number
});
const ActionAutoPair = t.interface({
    byeValue: t.Number,
    playerState: t.Any,
    roundId: t.Number,
    tourneyId: t.Number,
    unpairedPlayers: t.list(t.Number)
});
const ActionManualPair = t.interface({
    byeValue: t.Number,
    pair: t.list(t.Number),
    players: t.list(Player),
    roundId: t.Number,
    tourneyId: t.Number
});
const ActionSetMatchResult = t.interface({
    matchId: t.String,
    newRating: t.tuple([t.Number, t.Number]),
    result: t.tuple([t.Number, t.Number]),
    roundId: t.Number,
    tourneyId: t.Number
});
const ActionEditMatch = t.interface({
    matchId: t.String,
    roundId: t.Number,
    tourneyId: t.Number
});
const ActionMoveMatch = t.interface({
    newIndex: t.Number,
    oldIndex: t.Number,
    roundId: t.Number,
    tourneyId: t.Number
});
const ActionLoadState = t.interface({state: t.Any});
const ActionTypes = t.union([
    ActionLoadState,
    ActionAddTourney,
    ActionDelTourney,
    ActionAddRound,
    ActionDelLastRound,
    ActionAddRemoveTieBreak,
    ActionAddRemoveTieBreak,
    ActionMoveTieBreak,
    ActionSetTourneyPlayers,
    ActionSetByeQueue,
    ActionAutoPair,
    ActionManualPair,
    ActionSetMatchResult,
    ActionEditMatch,
    ActionMoveMatch
]);
ActionTypes.dispatch = function (x) {
    const typeToConstructor = {
        "ADD_ROUND": ActionAddRound,
        "ADD_TIEBREAK": ActionAddRemoveTieBreak,
        "ADD_TOURNEY": ActionAddTourney,
        "AUTO_PAIR": ActionAutoPair,
        "DEL_LAST_ROUND": ActionDelLastRound,
        "DEL_MATCH": ActionEditMatch,
        "DEL_TIEBREAK": ActionAddRemoveTieBreak,
        "DEL_TOURNEY": ActionDelTourney,
        "LOAD_STATE": ActionLoadState,
        "MANUAL_PAIR": ActionManualPair,
        "MOVE_MATCH": ActionMoveMatch,
        "MOVE_TIEBREAK": ActionMoveTieBreak,
        "SET_BYE_QUEUE": ActionSetByeQueue,
        "SET_MATCH_RESULT": ActionSetMatchResult,
        "SET_TOURNEY_PLAYERS": ActionSetTourneyPlayers,
        "SWAP_COLORS": ActionEditMatch
    };
    return typeToConstructor[x.type];
};

function tourneysReducer(state, action) {
    ActionTypes(action);
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
                    newRating: reverse(match.newRating),
                    origRating: reverse(match.origRating),
                    players: reverse(match.players),
                    result: reverse(match.result)
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
    case "LOAD_STATE":
        return action.state;
    default:
        throw new Error("Unexpected action type " + action.type);
    }
}

const TournamentContext = createContext(null);

export function useTournaments() {
    return useContext(TournamentContext);
}

export function useTournament(tourneyId) {
    const [tourneys, dispatch] = useContext(TournamentContext);
    return [tourneys[tourneyId], dispatch];
}

export function useRound(tourneyId, roundId) {
    const [tourney, dispatch] = useTournament(tourneyId);
    const matchList = tourney.roundList[roundId];
    const matched = matchList.reduce(
        (acc, match) => acc.concat(match.players),
        []
    );
    const unmatched = difference(tourney.players, matched);
    return {dispatch, matchList, tourney, unmatched};
}

export function TournamentProvider(props) {
    const loadedData = localStorageOrDefault("tourneys", defaultTourneyList);
    const [state, dispatch] = useReducer(tourneysReducer, loadedData);
    useEffect(
        function () {
            localStorage.setItem("tourneys", JSON.stringify(state));
        },
        [state]
    );
    return (
        createElement(
            TournamentContext.Provider,
            {value: [state, dispatch]},
            props.children
        )
    );
}
