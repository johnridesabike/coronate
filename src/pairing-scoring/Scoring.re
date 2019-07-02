open Utils;

type matchStat = {
  white: int,
  black: int,
};

type matchStatFloat = {
  white: float,
  black: float,
};

type matchStatString = {
  white: string,
  black: string,
};

[@bs.deriving abstract]
type scoreData = {
  colorScores: array(float),
  colors: array(int),
  id: string,
  isDummy: bool,
  opponentResults: Js.Dict.t(float),
  ratings: array(int),
  results: array(float),
  resultsNoByes: array(float),
};

let isNotDummy = (scoreDict, oppId) => {
  switch (Js.Dict.get(scoreDict, oppId)) {
  | None => true
  | Some(opponent) => !opponent->isDummyGet
  };
};

let getPlayerScore = (scoreDict, id) => {
  switch (Js.Dict.get(scoreDict, id)) {
  | None => 0.0
  | Some(player) => arraySumFloat(player->resultsGet)
  };
};

let getOpponentScores = (scoreDict, id) => {
  switch (Js.Dict.get(scoreDict, id)) {
  | None => [||]
  | Some(player) =>
    Js.Dict.keys(player->opponentResultsGet)
    |> Js.Array.filter(isNotDummy(scoreDict))
    |> Js.Array.map(getPlayerScore(scoreDict))
  };
};

// USCF § 34E1
let getMedianScore = (scoreDict, id) =>
  getOpponentScores(scoreDict, id)
  |> sort(ascend(x => x))
  |> Js.Array.slice(~start=1, ~end_=-1)
  |> arraySumFloat;

// USCF § 34E2.
let getSolkoffScore = (scoreDict, id) =>
  getOpponentScores(scoreDict, id) |> arraySumFloat;

// turn the regular score list into a "running" score list
let runningReducer = (acc, score) =>
  Js.Array.concat([|last(acc) +. score|], acc);

// USCF § 34E3.
let getCumulativeScore = (scoreDict, id) => {
  switch (Js.Dict.get(scoreDict, id)) {
  | None => 0.0
  | Some(person) =>
    person->resultsNoByesGet
    |> Js.Array.reduce(runningReducer, [|0.0|])
    |> arraySumFloat
  };
};

// USCF § 34E4.
let getCumulativeOfOpponentScore = (scoreDict, id) => {
  switch (Js.Dict.get(scoreDict, id)) {
  | None => 0.0
  | Some(person) =>
    Js.Dict.keys(person->opponentResultsGet)
    |> Js.Array.filter(isNotDummy(scoreDict))
    |> Js.Array.map(getCumulativeScore(scoreDict))
    |> arraySumFloat
  };
};

// USCF § 34E6
let getColorBalanceScore = (scoreDict, id) => {
  switch (Js.Dict.get(scoreDict, id)) {
  | None => 0.0
  | Some(person) => arraySumFloat(person->colorScoresGet)
  };
};

[@bs.deriving abstract]
type tieBreakData = {
  func: (Js.Dict.t(scoreData), string) => float,
  id: int,
  name: string,
};

let tieBreakMethods = [|
  tieBreakData(~func=getMedianScore, ~id=0, ~name="Median"),
  tieBreakData(~func=getSolkoffScore, ~id=1, ~name="Solkoff"),
  tieBreakData(~func=getCumulativeScore, ~id=2, ~name="Cumulative score"),
  tieBreakData(
    ~func=getCumulativeOfOpponentScore,
    ~id=3,
    ~name="Cumulative of opposition",
  ),
  tieBreakData(~func=getColorBalanceScore, ~id=4, ~name="Most black"),
|];

let getNamefromIndex = index => tieBreakMethods[index]->nameGet;
let getTieBreakNames = idList => Js.Array.map(getNamefromIndex, idList);

// This is useful for cases where the regular factory functions return empty
// results because a player hasn't been added yet.
let createBlankScoreData = id =>
  scoreData(
    ~colorScores=[||],
    ~colors=[||],
    ~id,
    ~isDummy=false,
    ~opponentResults=Js.Dict.empty(),
    ~ratings=[||],
    ~results=[||],
    ~resultsNoByes=[||],
  );

[@bs.deriving abstract]
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
    methods |> Js.Array.map(i => tieBreakMethods[i]->funcGet);
  let standings =
    Js.Dict.keys(scoreData)
    |> Js.Array.map(id =>
         standing(
           ~id,
           ~score=getPlayerScore(scoreData, id),
           ~tieBreaks=
             selectedTieBreakFuncs
             |> Js.Array.map(func => func(scoreData, id)),
         )
       );
  // create a list of functions to pass to `sortWith`. This will sort by
  // scores and then by each tiebreak value.
  let sortTieBreakFuncList =
    selectedTieBreakFuncs
    |> Js.Array.mapi((_, index) => descend(x => x->tieBreaksGet[index]));
  let sortFuncList =
    sortTieBreakFuncList->Js.Array.concat([|descend(x => x->scoreGet)|]);
  sortWith(sortFuncList, standings);
};

let areScoresEqual = (standing1, standing2) => {
  let equalScores = standing1->scoreGet !== standing2->scoreGet;
  equalScores
    ? false
    : !(
        standing1->tieBreaksGet
        |> Js.Array.reducei(
             (acc, value, i) =>
               Js.Array.concat(
                 acc,
                 [|value !== standing2->tieBreaksGet[i]|],
               ),
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
           i == 0
             // Always make a new rank for the first player
             ? true
             // Make a new rank if the scores aren't equal
             : !areScoresEqual(standing, standingList[i - 1]);
         };
         isNewRank
           // If this player doesn't have the same score, create a new
           // branch of the tree
           ? acc |> Js.Array.concat([|[|standing|]|])
           // If this player has the same score as the last, append it
           // to the last branch
           : {
             let lastIndex = Js.Array.length(acc) - 1;
             acc[lastIndex] = acc[lastIndex] |> Js.Array.concat([|standing|]);
             acc;
           };
       },
       [||],
     );
};