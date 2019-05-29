import {AvoidPair, Id, Player} from "../../data-types";
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
import {autoPair, manualPair} from "./match-functions";
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
    playerIds: t.list(Id)
});
const ActionSetByeQueue = t.interface({
    byeQueue: t.list(Id)
});
const ActionAutoPair = t.interface({
    avoidList: t.list(AvoidPair),
    byeValue: t.Number,
    players: t.dict(Id, Player),
    roundId: t.Number
});
const ActionManualPair = t.interface({
    byeValue: t.Number,
    pair: t.tuple([Player, Player]),
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
const ActionSetName = t.interface({
    name: t.String
});
const ActionSetDate = t.interface({
    date: Date
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
    ActionSetName,
    ActionSetTourneyPlayers,
    ActionSetByeQueue,
    ActionSetDate,
    ActionAutoPair,
    ActionManualPair,
    ActionSetMatchResult,
    ActionEditMatch,
    ActionMoveMatch
]);
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
        "SET_DATE": ActionSetDate,
        "SET_MATCH_RESULT": ActionSetMatchResult,
        "SET_NAME": ActionSetName,
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
            "playerIds",
            action.playerIds,
            state
        );
    case "SET_BYE_QUEUE":
        return assoc(
            "byeQueue",
            action.byeQueue,
            state
        );
    case "SET_NAME":
        return assoc(
            "name",
            action.name,
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
                    players: action.players,
                    roundId: action.roundId,
                    tourney: state
                })
            ),
            state
        );
    case "MANUAL_PAIR":
        return over(
            lensPath(["roundList", action.roundId]),
            append(manualPair(action.pair, action.byeValue)),
            state
        );
    case "SET_DATE":
        return assoc(
            "date",
            action.date,
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
                    playerIds: reverse(match.playerIds),
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
        console.log("setting state:", action.state);
        return action.state;
    default:
        throw new Error("Unexpected action type " + action.type);
    }
}
