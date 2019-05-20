import {
    createContext,
    createElement,
    useContext,
    useReducer,
    useEffect
} from "react";
import {
    __,
    append,
    concat,
    difference,
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
import t from "tcomb";
import {localStorageOrDefault} from "./helpers";
import defaultTourneyList from "./demo-tourney.json";
import {autoPair, manualPair} from "./match-functions";
import {createTournament, Player} from "../factories";

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
    tourneyId: t.Number,
    players: t.list(Player)
});
const ActionAddRemoveTieBreak = t.interface({
    tourneyId: t.Number,
    id: t.Number
});
const ActionMoveTieBreak = t.interface({
    tourneyId: t.Number,
    oldIndex: t.Number,
    newIndex: t.Number
});
const ActionSetTourneyPlayers = t.interface({
    tourneyId: t.Number,
    players: t.list(t.Number)
});
const ActionSetByeQueue = t.interface({
    tourneyId: t.Number,
    byeQueue: t.list(t.Number)
});
const ActionAutoPair = t.interface({
    tourneyId: t.Number,
    roundId: t.Number,
    unpairedPlayers: t.list(t.Number),
    playerState: t.Any,
    byeValue: t.Number
});
const ActionManualPair = t.interface({
    tourneyId: t.Number,
    roundId: t.Number,
    pair: t.list(t.Number),
    players: t.list(Player),
    byeValue: t.Number
});
const ActionSetMatchResult = t.interface({
    tourneyId: t.Number,
    roundId: t.Number,
    matchId: t.String,
    result: t.tuple([t.Number, t.Number]),
    newRating: t.tuple([t.Number, t.Number])
});
const ActionEditMatch = t.interface({
    tourneyId: t.Number,
    roundId: t.Number,
    matchId: t.String
});
const ActionMoveMatch = t.interface({
    tourneyId: t.Number,
    roundId: t.Number,
    oldIndex: t.Number,
    newIndex: t.Number
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
        "LOAD_STATE": ActionLoadState,
        "ADD_TOURNEY": ActionAddTourney,
        "DEL_TOURNEY": ActionDelTourney,
        "ADD_ROUND": ActionAddRound,
        "DEL_LAST_ROUND": ActionDelLastRound,
        "ADD_TIEBREAK": ActionAddRemoveTieBreak,
        "DEL_TIEBREAK": ActionAddRemoveTieBreak,
        "MOVE_TIEBREAK": ActionMoveTieBreak,
        "SET_TOURNEY_PLAYERS": ActionSetTourneyPlayers,
        "SET_BYE_QUEUE": ActionSetByeQueue,
        "AUTO_PAIR": ActionAutoPair,
        "MANUAL_PAIR": ActionManualPair,
        "SET_MATCH_RESULT": ActionSetMatchResult,
        "DEL_MATCH": ActionEditMatch,
        "SWAP_COLORS": ActionEditMatch,
        "MOVE_MATCH": ActionMoveMatch
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
    return {tourney, dispatch, unmatched, matchList};
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
