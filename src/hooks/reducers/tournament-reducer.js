import {AvoidList, Player} from "../../data-types";
import {
    __,
    append,
    assoc,
    concat,
    filter,
    findIndex,
    lensPath,
    lensProp,
    mergeRight,
    move,
    over,
    pipe,
    propEq,
    remove,
    reverse,
    set
} from "ramda";
import {autoPair, manualPair} from "../../state/match-functions";
import t from "tcomb";

const ActionAddRound = t.interface({});
const ActionDelLastRound = t.interface({});
const ActionAddRemoveTieBreak = t.interface({
    id: t.Number
});
const ActionMoveTieBreak = t.interface({
    newIndex: t.Number,
    oldIndex: t.Number
});
const ActionSetTourneyPlayers = t.interface({
    players: t.list(t.Number)
});
const ActionSetByeQueue = t.interface({
    byeQueue: t.list(t.Number)
});
const ActionAutoPair = t.interface({
    avoidList: AvoidList,
    byeValue: t.Number,
    playerDataList: t.list(Player),
    roundId: t.Number,
    unpairedPlayers: t.list(t.Number)
});
const ActionManualPair = t.interface({
    byeValue: t.Number,
    pair: t.list(t.Number),
    players: t.list(Player),
    roundId: t.Number
});
const ActionSetMatchResult = t.interface({
    matchId: t.String,
    newRating: t.tuple([t.Number, t.Number]),
    result: t.tuple([t.Number, t.Number]),
    roundId: t.Number
});
const ActionEditMatch = t.interface({
    matchId: t.String,
    roundId: t.Number
});
const ActionMoveMatch = t.interface({
    newIndex: t.Number,
    oldIndex: t.Number,
    roundId: t.Number
});
const ActionLoadState = t.interface({
    state: t.Any
});
const ActionTypes = t.union([
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
// TODO: Am I doing this right?
ActionTypes.dispatch = function (action) {
    const typeToConstructor = {
        "ADD_ROUND": ActionAddRound,
        "ADD_TIEBREAK": ActionAddRemoveTieBreak,
        "AUTO_PAIR": ActionAutoPair,
        "DEL_LAST_ROUND": ActionDelLastRound,
        "DEL_MATCH": ActionEditMatch,
        "DEL_TIEBREAK": ActionAddRemoveTieBreak,
        "MANUAL_PAIR": ActionManualPair,
        "MOVE_MATCH": ActionMoveMatch,
        "MOVE_TIEBREAK": ActionMoveTieBreak,
        "SET_BYE_QUEUE": ActionSetByeQueue,
        "SET_MATCH_RESULT": ActionSetMatchResult,
        "SET_STATE": ActionLoadState,
        "SET_TOURNEY_PLAYERS": ActionSetTourneyPlayers,
        "SWAP_COLORS": ActionEditMatch
    };
    return typeToConstructor[action.type];
};

export default function tournamentReducer(state, action) {
    ActionTypes(action);
    switch (action.type) {
    case "ADD_ROUND":
        return over(
            lensProp("roundList"),
            append([]),
            state
        );
    case "DEL_LAST_ROUND":
        return over(
            lensProp("roundList"),
            remove(-1, 1),
            state
        );
    case "ADD_TIEBREAK":
        return over(
            lensProp("tieBreaks"),
            append(action.id),
            state
        );
    case "DEL_TIEBREAK":
        return over(
            lensProp("tieBreaks"),
            filter((id) => id !== action.id),
            state
        );
    case "MOVE_TIEBREAK":
        return over(
            lensProp("tieBreaks"),
            move(action.oldIndex, action.newIndex),
            state
        );
    case "SET_TOURNEY_PLAYERS":
        return assoc(
            "players",
            action.players,
            state
        );
    case "SET_BYE_QUEUE":
        return assoc(
            "byeQueue",
            action.byeQueue,
            state
        );
    case "AUTO_PAIR":
        return over(
            lensPath(["roundList", action.roundId]),
            concat(
                __,
                autoPair({
                    avoidList: action.avoidList,
                    byeValue: action.byeValue,
                    playerDataList: action.playerDataList,
                    roundId: action.roundId,
                    tourney: state,
                    unPairedPlayers: action.unpairedPlayers
                })
            ),
            state
        );
    case "MANUAL_PAIR":
        return over(
            lensPath(["roundList", action.roundId]),
            append(manualPair(action.players, action.pair, action.byeValue)),
            state
        );
    case "SET_MATCH_RESULT":
        return pipe(
            set(
                lensPath([
                    "roundList",
                    action.roundId,
                    findIndex(
                        propEq("id", action.matchId),
                        state.roundList[action.roundId]
                    ),
                    "result"
                ]),
                action.result
            ),
            set(
                lensPath([
                    "roundList",
                    action.roundId,
                    findIndex(
                        propEq("id", action.matchId),
                        state.roundList[action.roundId]
                    ),
                    "newRating"
                ]),
                action.newRating,
            ),
        )(state);
    case "DEL_MATCH":
        return over(
            lensPath(["roundList", action.roundId]),
            filter((match) => match.id !== action.matchId),
            state
        );
    case "SWAP_COLORS":
        return over(
            lensPath([
                "roundList",
                action.roundId,
                findIndex(
                    propEq("id", action.matchId),
                    state.roundList[action.roundId]
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
            lensPath(["roundList", action.roundId]),
            move(action.oldIndex, action.newIndex),
            state
        );
    case "SET_STATE":
        return action.state;
    default:
        throw new Error("Unexpected action type " + action.type);
    }
}
