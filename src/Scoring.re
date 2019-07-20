/*
   This handles all of the score tiebreak logic. Not all of the USCF methods
   are implemented yet, just the most common ones.
 */

open Utils;
open Belt;

type scoreData = {
  colorScores: list(float),
  colors: list(int),
  id: string,
  isDummy: bool,
  opponentResults: Map.String.t(float),
  ratings: list(int),
  firstRating: int,
  results: list(float),
  resultsNoByes: list(float),
};

let isNotDummy = (scoreDict, oppId) => {
  switch (scoreDict->Map.String.get(oppId)) {
  | None => true
  | Some(opponent) => !opponent.isDummy
  };
};

let getPlayerScore = (scoreDict, id) => {
  switch (scoreDict->Map.String.get(id)) {
  | None => 0.0
  | Some(player) => listSumFloat(player.results)
  };
};

let getOpponentScores = (scoreDict, id) => {
  switch (scoreDict->Map.String.get(id)) {
  | None => [||]
  | Some(player) =>
    player.opponentResults->Map.String.keysToArray
    |> Js.Array.filter(isNotDummy(scoreDict))
    |> Js.Array.map(getPlayerScore(scoreDict))
  };
};

// USCF § 34E1
let getMedianScore = (scoreDict, id) =>
  getOpponentScores(scoreDict, id)
  ->Belt.SortArray.stableSortBy(ascend(x => x))
  |> Js.Array.slice(~start=1, ~end_=-1)
  |> arraySumFloat;

// USCF § 34E2.
let getSolkoffScore = (scoreDict, id) =>
  getOpponentScores(scoreDict, id) |> arraySumFloat;

// turn the regular score list into a "running" score list
let runningReducer = (acc, score) => {
  let lastScore =
    switch (acc) {
    | [last, ..._] => last
    | [] => 0.0
    };
  [lastScore +. score, ...acc];
};

// USCF § 34E3.
let getCumulativeScore = (scoreDict, id) => {
  switch (scoreDict->Map.String.get(id)) {
  | None => 0.0
  | Some(person) =>
    person.resultsNoByes->List.reduce([], runningReducer)->listSumFloat
  };
};

// USCF § 34E4.
let getCumulativeOfOpponentScore = (scoreDict, id) => {
  switch (scoreDict->Map.String.get(id)) {
  | None => 0.0
  | Some(person) =>
    person.opponentResults->Map.String.keysToArray
    |> Js.Array.filter(isNotDummy(scoreDict))
    |> Js.Array.map(getCumulativeScore(scoreDict))
    |> arraySumFloat
  };
};

// USCF § 34E6
let getColorBalanceScore = (scoreDict, id) => {
  switch (scoreDict->Map.String.get(id)) {
  | None => 0.0
  | Some(person) => listSumFloat(person.colorScores)
  };
};

type tieBreakData = {
  func: (Map.String.t(scoreData), string) => float,
  id: int,
  name: string,
};

let tieBreakMethods = [|
  {func: getMedianScore, id: 0, name: "Median"},
  {func: getSolkoffScore, id: 1, name: "Solkoff"},
  {func: getCumulativeScore, id: 2, name: "Cumulative score"},
  {
    func: getCumulativeOfOpponentScore,
    id: 3,
    name: "Cumulative of opposition",
  },
  {func: getColorBalanceScore, id: 4, name: "Most black"},
|];

let getNamefromIndex = index => tieBreakMethods->Array.getExn(index).name;
let getTieBreakNames = idList => Js.Array.map(getNamefromIndex, idList);

// This is useful for cases where the regular factory functions return empty
// results because a player hasn't been added yet.
let createBlankScoreData = id => {
  colorScores: [],
  colors: [],
  id,
  isDummy: false,
  opponentResults: Map.String.empty,
  ratings: [],
  firstRating: 0,
  results: [],
  resultsNoByes: [],
};

type standing = {
  id: string,
  score: float,
  tieBreaks: array(float),
};

// Sort the standings by score, see USCF tie-break rules from § 34.
// Returns the list of the standings. Each standing has a `tieBreaks` property
// which lists the score associated with each method. The order of these
// coresponds to the order of the method names in the second list.
let createStandingList = (methods, scoreData) => {
  let selectedTieBreakFuncs =
    methods |> Js.Array.map(i => tieBreakMethods->Array.getExn(i).func);
  let standings =
    scoreData->Map.String.keysToArray
    |> Js.Array.map(id =>
         {
           id,
           score: getPlayerScore(scoreData, id),
           tieBreaks:
             selectedTieBreakFuncs
             |> Js.Array.map(func => func(scoreData, id)),
         }
       );
  // create a list of functions to pass to `sortWith`. This will sort by
  // scores and then by each tiebreak value.
  let sortTieBreakFuncList =
    selectedTieBreakFuncs
    |> Js.Array.mapi((_, index) => descend(x => x.tieBreaks[index]));
  let sortFuncList =
    sortTieBreakFuncList->Js.Array.concat([|descend(x => x.score)|]);
  sortWith(sortFuncList, standings);
};

let areScoresEqual = (standing1, standing2) => {
  let equalScores = standing1.score !== standing2.score;
  equalScores
    ? false
    : !(
        standing1.tieBreaks
        |> Js.Array.reducei(
             (acc, value, i) =>
               acc->Js.Array.concat([|
                 value !== standing2.tieBreaks->Array.getExn(i),
               |]),
             [||],
           )
        |> Js.Array.includes(true)
      );
};

// Groups the standings by score, see USCF tie-break rules from § 34.
// example: `[[Dale, Audrey], [Pete], [Bob]]` Dale and Audrey are tied for
// first, Pete is 2nd, Bob is 3rd.
let createStandingTree = standingList => {
  standingList
  |> Js.Array.reducei(
       (acc, standing, i) => {
         let isNewRank = {
           i === 0
             // Always make a new rank for the first player
             ? true
             // Make a new rank if the scores aren't equal
             : !areScoresEqual(standing, standingList->Array.getExn(i - 1));
         };
         isNewRank
           // If this player doesn't have the same score, create a new
           // branch of the tree
           ? acc |> Js.Array.concat([|[|standing|]|])
           // If this player has the same score as the last, append it
           // to the last branch
           : {
             let lastIndex = Js.Array.length(acc) - 1;
             let _ =
               acc->Array.set(
                 lastIndex,
                 acc->Array.getExn(lastIndex)
                 |> Js.Array.concat([|standing|]),
               );
             acc;
           };
       },
       [||],
     );
};

module Ratings = {
  let getKFactor = matchCount => {
    let ne = matchCount > 0 ? matchCount : 1;
    800 / ne;
  };

  let floor = 100;

  let keepAboveFloor = rating => rating > floor ? rating : floor;

  module EloRank = Externals.EloRank;
  let calcNewRatings =
      (
        (whiteRating, blackRating),
        (whiteMatchCount, blackMatchCount),
        (whiteResult, blackResult),
      ) => {
    let whiteElo = getKFactor(whiteMatchCount)->EloRank.make;
    let blackElo = getKFactor(blackMatchCount)->EloRank.make;
    let (whiteScoreExpected, blackScoreExpected) = (
      whiteElo->EloRank.getExpected(whiteRating, blackRating),
      blackElo->EloRank.getExpected(blackRating, whiteRating),
    );
    (
      whiteElo
      ->EloRank.updateRating(whiteScoreExpected, whiteResult, whiteRating)
      ->keepAboveFloor,
      blackElo
      ->EloRank.updateRating(blackScoreExpected, blackResult, blackRating)
      ->keepAboveFloor,
    );
  };
};