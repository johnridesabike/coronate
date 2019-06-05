// import {
//     AvoidPair,
//     DUMMY_ID,
//     Id,
//     Player,
//     PlayerStats,
//     RoundList
// } from "../data-types";
// import {
//     add,
//     assoc,
//     curry,
//     descend,
//     filter,
//     findLastIndex,
//     lensIndex,
//     map,
//     over,
//     pipe,
//     prop,
//     reverse,
//     sortWith,
//     splitAt,
//     view
// } from "ramda";
// import blossom from "edmonds-blossom";
// import {createPlayerStats} from "./factories";
// import t from "tcomb";

/**
 * pipe(
 *     rounds2Matches,
 *     matches2ScoreData,
 *     scoreData2PairingData(playerData, avoidList),
 *     sortDataforPairing,
 *     setUpperHalves,
 *     setByePlayer(byeQueue)
 * )(rounds);
 */
