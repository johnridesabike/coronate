import React from "react";
// import last from "ramda/src/last";
// import curry from "ramda/src/curry";
import move from "ramda/src/move";
import lensPath from "ramda/src/lensPath";
import lensProp from "ramda/src/lensProp";
import lensIndex from "ramda/src/lensIndex";
import set from "ramda/src/set";
import view from "ramda/src/view";
import remove from "ramda/src/remove";
import append from "ramda/src/append";
// import {createPlayer, getPlayerById} from "../data/player";
import {getById} from "../data/utility";
import defaultOptions from "./demo-options.json";
import defaultTourneyList from "./demo-tourney.json";
import {autoPair, manualPair, swapColors} from "./match-functions";
/**
 * @typedef {import("./dispatch").Action} Action
 * @typedef {import("./dispatch").GlobalState} GlobalState
 */

/**
 * @type {GlobalState}
 */
const defaultData = {
    options: defaultOptions,
    // @ts-ignore
    tourneys: defaultTourneyList
};

/**
 * @param {GlobalState} state
 * @param {Action} action
 * @returns {GlobalState}
 */
function dataReducer(state, action) {
    console.group("data dispatched");
    console.log("previous data", state);
    console.log("data action", action);
    console.groupEnd();
    const {options, tourneys} = state;
    // const getPlayer = curry(getPlayerById)(players);
    const setTourneys = set(lensPath(["tourneys"]));
    switch (action.type) {
    // Options
    case "SET_BYE_VALUE":
        options.byeValue = action.byeValue;
        return Object.assign({}, state);
    // Tournaments
    case "ADD_TOURNEY":
        // return Object.assign(
        //     {},
        //     state,
        //     {tourneys: tourneys.concat([action.tourney])}
        // );
        return setTourneys(
            append(action.tourney, state.tourneys),
            state
        );
    case "DEL_TOURNEY":
        // return Object.assign(
        //     {},
        //     state,
        //     {tourneys: tourneys.filter((ignore, i) => i !== action.index)}
        // );
        return setTourneys(
            state.tourneys.filter((ignore, i) => i !== action.index),
            state
        );
    case "ADD_ROUND":
        // tourneys[action.tourneyId].roundList = (
        //     tourneys[action.tourneyId].roundList.concat([[]])
        // );
        // return Object.assign({}, state);
        console.log(
            action.tourneyId,
            state.tourneys,
            view(
                lensIndex(action.tourneyId),
                state.tourneys
            )
        );
        const test = set(
            lensPath(["tourneys", action.tourneyId, "roundlist"]),
            append([], state.tourneys[action.tourneyId].roundList),
            state
        );
        // console.log(test);
        // console.log(state);
        // console.log(append([], state.tourneys[action.tourneyId].roundList));
        return test;
    case "DEL_LAST_ROUND":
        // if a match has been scored, then reset it.
        // last(
        //     tourneys[action.tourneyId].roundList
        // ).forEach(function (match) {
        //     if (match.result.reduce((a, b) => a + b) !== 0) {
        //         match.players.forEach(function (pId, color) {
        //             getPlayer(pId).matchCount -= 1;
        //             getPlayer(pId).rating = (
        //                 match.origRating[color]
        //             );
        //         });
        //     }
        // });
        // tourneys[action.tourneyId].roundList = (
        //     tourneys[action.tourneyId].roundList.slice(
        //         0,
        //         tourneys[action.tourneyId].roundList.length - 1
        //     )
        // );
        // return Object.assign({}, state);
        console.log(remove(-1, 1, state.tourneys[action.tourneyId].roundList));
        return set(
            lensPath(["tourneys", action.tourneyId, "roundlist"]),
            remove(-1, 1, state.tourneys[action.tourneyId].roundList),
            state
        );
    case "ADD_TIEBREAK":
        tourneys[action.tourneyId].tieBreaks = (
            tourneys[action.tourneyId].tieBreaks.concat([action.id])
        );
        return Object.assign({}, state);
    case "DEL_TIEBREAK":
        tourneys[action.tourneyId].tieBreaks = (
            tourneys[action.tourneyId].tieBreaks.filter(
                (id) => id !== action.id
            )
        );
        return Object.assign({}, state);
    case "MOVE_TIEBREAK":
        tourneys[action.tourneyId].tieBreaks = move(
            action.oldIndex,
            action.newIndex,
            tourneys[action.tourneyId].tieBreaks
        );
        return Object.assign({}, state);
    case "SET_TOURNEY_PLAYERS":
        tourneys[action.tourneyId].players = action.players;
        return Object.assign({}, state);
    case "SET_BYE_QUEUE":
        tourneys[action.tourneyId].byeQueue = action.byeQueue;
        return Object.assign({}, state);
    case "AUTO_PAIR":
        tourneys[action.tourneyId].roundList[action.roundId] = (
            tourneys[action.tourneyId].roundList[action.roundId].concat(
                autoPair(
                    state,
                    action.playerState,
                    action.tourneyId,
                    action.roundId,
                    action.unpairedPlayers
                )
            )
        );
        return Object.assign({}, state);
    case "MANUAL_PAIR":
        tourneys[action.tourneyId].roundList[action.roundId] = (
            tourneys[action.tourneyId].roundList[action.roundId].concat([
                manualPair(
                    state,
                    action.players,
                    action.pair
                )
            ])
        );
        return Object.assign({}, state);
    case "SET_MATCH_RESULT":
        getById(
            tourneys[action.tourneyId].roundList[action.roundId],
            action.matchId
        ).result = action.result;
        getById(
            tourneys[action.tourneyId].roundList[action.roundId],
            action.matchId
        ).newRating = action.newRating;
        return Object.assign({}, state);
    case "DEL_MATCH":
        tourneys[action.tourneyId].roundList[action.roundId] = (
            tourneys[action.tourneyId].roundList[action.roundId].filter(
                (match) => match.id !== action.matchId
            )
        );
        return Object.assign({}, state);
    case "SWAP_COLORS":
        swapColors(state, action.tourneyId, action.roundId, action.matchId);
        return Object.assign({}, state);
    case "MOVE_MATCH":
        tourneys[action.tourneyId].roundList[action.roundId] = move(
            action.oldIndex,
            action.newIndex,
            tourneys[action.tourneyId].roundList[action.roundId]
        );
        return Object.assign({}, state);
    default:
        throw new Error("Unexpected action type");
    }
}

/** @type {{data: GlobalState, dispatch: React.Dispatch<Action>}} */
const defaultContext = null;
const DataContext = React.createContext(defaultContext);

// TODO the reducer is firing twice which leads to unexpected behavior (e.g.
// "new round" will create two rounds). I'm investigating what's going on and
// looking for ways to fix it.
// https://stackoverflow.com/questions/54892403/usereducer-action-dispatched-twice

function useDataReducer() {
    return React.useReducer(dataReducer, defaultData);
}

export function useData() {
    return React.useContext(DataContext);
}

/**
 * @param {Object} props
 */
export function DataProvider(props) {
    const [data, dispatch] = useDataReducer();
    React.useEffect(
        function () {
            console.log("rendered data.");
        },
        [data]
    );
    React.useEffect(
        function () {
            console.log("New data dispatch!!!!!");
        },
        [dispatch]
    );
    return (
        <DataContext.Provider value={{data, dispatch}}>
            {props.children}
        </DataContext.Provider>
    );
}
