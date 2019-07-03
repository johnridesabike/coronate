import t from "tcomb";
import {move} from "ramda";
import {autoPair, manualPair, scoreByeMatch} from "./match-functions";
import {types} from "../../../data-types";

// eslint-disable-next-line complexity
export default function tournamentReducer(state, action) {
    let matchIndex;
    const nextState = {};
    switch (action.type) {
    case "ADD_ROUND":
        nextState.roundList = state.roundList.concat([[]]);
        break;
    case "DEL_LAST_ROUND":
        nextState.roundList = state.roundList.slice(0, -1);
        break;
    case "ADD_TIEBREAK":
        t.interface({id: t.Number})(action);
        nextState.tieBreaks = state.tieBreaks.concat([action.id]);
        break;
    case "DEL_TIEBREAK":
        t.interface({id: t.Number})(action);
        nextState.tieBreaks = state.tieBreaks.filter((id) => id !== action.id);
        break;
    case "MOVE_TIEBREAK":
        t.interface({
            newIndex: t.Number,
            oldIndex: t.Number
        })(action);
        nextState.tieBreaks = move(
            action.oldIndex,
            action.newIndex,
            state.tieBreaks
        );
        break;
    case "SET_TOURNEY_PLAYERS":
        t.interface({playerIds: t.list(types.Id)})(action);
        nextState.playerIds = action.playerIds;
        break;
    case "SET_BYE_QUEUE":
        t.interface({byeQueue: t.list(types.Id)})(action);
        nextState.byeQueue = action.byeQueue;
        break;
    case "SET_NAME":
        t.interface({name: t.String})(action);
        nextState.name = action.name;
        break;
    case "AUTO_PAIR":
        // t.interface({
        //     byeValue: t.Number,
        //     pairData: t.dict(types.Id, scoreTypes.PairingData),
        //     players: t.dict(types.Id, types.Player),
        //     roundId: t.Number
        // })(action);
        nextState.roundList = state.roundList.slice();
        nextState.roundList[action.roundId] = (
            nextState.roundList[action.roundId].concat(
                autoPair({
                    byeValue: action.byeValue,
                    pairData: action.pairData,
                    players: action.players,
                    tourney: state
                })
            )
        );
        break;
    case "MANUAL_PAIR":
        t.interface({
            byeValue: t.Number,
            pair: t.tuple([types.Player, types.Player]),
            roundId: t.Number
        })(action);
        nextState.roundList = state.roundList.slice();
        nextState.roundList[action.roundId] = (
            nextState.roundList[action.roundId].concat([
                manualPair(action.pair, action.byeValue)
            ])
        );
        break;
    case "SET_DATE":
        t.interface({date: Date})(action);
        nextState.date = action.date;
        break;
    case "SET_MATCH_RESULT":
        t.interface({
            matchId: t.String,
            newRating: t.tuple([t.Number, t.Number]),
            result: t.tuple([t.Number, t.Number]),
            roundId: t.Number
        })(action);
        // This is a lot of nested values, but right now I'm not sure what the
        // easier way of doing this is
        nextState.roundList = state.roundList.slice();
        nextState.roundList[action.roundId] = (
            state.roundList[action.roundId].slice()
        );
        matchIndex = nextState.roundList[action.roundId].findIndex(
            ({id}) => id === action.matchId
        );
        nextState.roundList[action.roundId][matchIndex] = {
            ...nextState.roundList[action.roundId][matchIndex],
            ...{result: action.result, newRating: action.newRating}
        };
        break;
    case "DEL_MATCH":
        t.interface({matchId: types.Id, roundId: t.Number})(action);
        nextState.roundList = state.roundList.slice();
        nextState.roundList[action.roundId] = (
            nextState.roundList[action.roundId].filter(
                (match) => match.id !== action.matchId
            )
        );
        break;
    case "SWAP_COLORS":
        t.interface({matchId: types.Id, roundId: t.Number})(action);
        nextState.roundList = state.roundList.slice();
        nextState.roundList[action.roundId] = (
            state.roundList[action.roundId].slice()
        );
        matchIndex = nextState.roundList[action.roundId].findIndex(
            ({id}) => id === action.matchId
        );
        let oldMatch = nextState.roundList[action.roundId][matchIndex];
        nextState.roundList[action.roundId][matchIndex] = {
            ...oldMatch,
            ...{
                newRating: oldMatch.newRating.slice().reverse(),
                origRating: oldMatch.origRating.slice().reverse(),
                playerIds: oldMatch.playerIds.slice().reverse(),
                result: oldMatch.result.slice().reverse()
            }
        };
        break;
    case "MOVE_MATCH":
        t.interface({
            newIndex: t.Number,
            oldIndex: t.Number,
            roundId: t.Number
        })(action);
        nextState.roundList = state.roundList.slice();
        nextState.roundList[action.roundId] = move(
            action.oldIndex,
            action.newIndex,
            nextState.roundList[action.roundId]
        );
        break;
    case "UPDATE_BYE_SCORES":
        t.interface({value: t.Number})(action);
        nextState.roundList = state.roundList.map(
            (round) => round.map((match) => scoreByeMatch(action.value, match))
        );
        break;
    case "SET_STATE":
        return action.state;
    default:
        throw new Error("Unexpected action type " + action.type);
    }
    return types.Tournament({...state, ...nextState});
}
