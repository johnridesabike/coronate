/*
   This handles all of the score tiebreak logic. Not all of the USCF methods
   are implemented yet, just the most common ones.
 */
open Belt;

module Color = {
  type t =
    | White
    | Black;
  let opposite = color =>
    switch (color) {
    | White => Black
    | Black => White
    };
  /*
    This is used for calculating the "most black" tiebreak.
   */
  let toScore = color =>
    switch (color) {
    | White => (-1.0)
    | Black => 1.0
    };
};

type t = {
  colorScores: list(float),
  colors: list(Color.t), /* This is used to create pairing data*/
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
  | Some(player) => Utils.List.sumF(player.results)
  };
};

let getOpponentScores = (scoreDict, id) => {
  switch (scoreDict->Map.String.get(id)) {
  | None => [||]
  | Some(player) =>
    player.opponentResults
    ->Map.String.keysToArray
    ->Array.keep(isNotDummy(scoreDict))
    ->Array.map(getPlayerScore(scoreDict))
  };
};

/* USCF § 34E1 */
let getMedianScore = (scoreDict, id) =>
  getOpponentScores(scoreDict, id)->SortArray.stableSortBy(compare)
  |> Js.Array.slice(~start=1, ~end_=-1)
  |> Utils.Array.sumF;

/* USCF § 34E2.*/
let getSolkoffScore = (scoreDict, id) =>
  getOpponentScores(scoreDict, id) |> Utils.Array.sumF;

/* turn the regular score list into a "running" score list */
let runningReducer = (acc, score) => {
  let lastScore =
    switch (acc) {
    | [last, ..._] => last
    | [] => 0.0
    };
  [lastScore +. score, ...acc];
};

/* USCF § 34E3.*/
let getCumulativeScore = (scoreDict, id) => {
  switch (scoreDict->Map.String.get(id)) {
  | None => 0.0
  | Some(person) =>
    person.resultsNoByes->List.reduce([], runningReducer)->Utils.List.sumF
  };
};

/* USCF § 34E4.*/
let getCumulativeOfOpponentScore = (scoreDict, id) => {
  switch (scoreDict->Map.String.get(id)) {
  | None => 0.0
  | Some(person) =>
    person.opponentResults
    ->Map.String.keysToArray
    ->Array.keep(isNotDummy(scoreDict))
    ->Array.map(getCumulativeScore(scoreDict))
    ->Utils.Array.sumF
  };
};

/* USCF § 34E6. */
let getColorBalanceScore = (scoreDict, id) => {
  switch (scoreDict->Map.String.get(id)) {
  | None => 0.0
  | Some(person) => Utils.List.sumF(person.colorScores)
  };
};

type tieBreakData = {
  func: (Map.String.t(t), string) => float,
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

/*
 This is useful for cases where the regular factory functions return empty
 results because a player hasn't been added yet.
 */
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

let standingsSorter = (a, b) => {
  let result = ref(0);
  let tieBreakIndex = ref(0);
  let break = ref(false);
  while (result^ === 0 && ! break^) {
    switch (compare(b.score, a.score)) {
    | 0 =>
      switch (
        b.tieBreaks->Array.get(tieBreakIndex^),
        a.tieBreaks->Array.get(tieBreakIndex^),
      ) {
      | (Some(tb_b), Some(tb_a)) =>
        switch (compare(tb_b, tb_a)) {
        | 0 => tieBreakIndex := tieBreakIndex^ + 1
        | x => result := x
        }
      | (None, Some(_))
      | (Some(_), None)
      | (None, None) => break := true
      }
    | x => result := x
    };
  };
  result^;
};

/*
 Sort the standings by score, see USCF tie-break rules from § 34.
 Returns the list of the standings. Each standing has a `tieBreaks` property
 which lists the score associated with each method. The order of these
 coresponds to the order of the method names in the second list.
 */
let createStandingList = (scoreData: Map.String.t(t), methods) => {
  let selectedTieBreakFuncs =
    methods |> Js.Array.map(i => tieBreakMethods->Array.getExn(i).func);
  scoreData
  ->Map.String.reduce([], (acc, id, data) =>
      [
        {
          id,
          score: Utils.List.sumF(data.results),
          tieBreaks:
            selectedTieBreakFuncs |> Js.Array.map(fn => fn(scoreData, id)),
        },
        ...acc,
      ]
    )
  /* The `reverse` just ensures that ties are sorted according to their original
     order (alphabetically by name) and not reversed. It has no practical
     purpose and should probably be replaced with a more robust sorting option
     */
  ->List.reverse
  ->List.sort(standingsSorter);
};

let areScoresEqual = (standing1, standing2) =>
  if (standing1.score !== standing2.score) {
    false;
  } else {
    !
      standing1.tieBreaks
      ->Array.reduceWithIndex([], (acc, value, i) =>
          [value !== standing2.tieBreaks->Array.getExn(i), ...acc]
        )
      ->List.has(true, (===)); /* NOT */
  };

/*
 Groups the standings by score, see USCF tie-break rules from § 34.
 example: `[[Dale, Audrey], [Pete], [Bob]]` Dale and Audrey are tied for
 first, Pete is 2nd, Bob is 3rd.
 */
let createStandingTree = (standingList: list(standing)) =>
  standingList->List.reduce([], (acc, standing) =>
    switch (acc) {
    /* Always make a new rank for the first player */
    | [] => [[standing]]
    | [lastRank, ...pastRanks] =>
      switch (lastRank) {
      | [] => [[standing], ...acc]
      | [lastStanding, ..._] =>
        /* Make a new rank if the scores aren't equal */
        if (!areScoresEqual(lastStanding, standing)) {
          [[standing], lastRank, ...pastRanks];
        } else {
          [[standing, ...lastRank], ...pastRanks];
        }
      }
    }
  );

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