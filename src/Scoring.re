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
  | None => []
  | Some(player) =>
    player.opponentResults
    ->Map.String.reduce([], (acc, oppId, _) =>
        if (isNotDummy(scoreDict, oppId)) {
          [getPlayerScore(scoreDict, oppId), ...acc];
        } else {
          acc;
        }
      )
  };
};

/* USCF § 34E1 */
let getMedianScore = (scoreDict, id) =>
  scoreDict
  ->getOpponentScores(id)
  ->List.sort(compare)
  ->List.tail
  ->Option.mapWithDefault([], List.reverse)
  ->List.tail
  ->Option.mapWithDefault(0.0, Utils.List.sumF);

/* USCF § 34E2.*/
let getSolkoffScore = (scoreDict, id) =>
  getOpponentScores(scoreDict, id)->Utils.List.sumF;

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
    ->Map.String.reduce([], (acc, key, _) =>
        if (isNotDummy(scoreDict, key)) {
          [key, ...acc];
        } else {
          acc;
        }
      )
    ->List.map(getCumulativeScore(scoreDict))
    ->Utils.List.sumF
  };
};

/* USCF § 34E6. */
let getColorBalanceScore = (scoreDict, id) => {
  switch (scoreDict->Map.String.get(id)) {
  | None => 0.0
  | Some(person) => Utils.List.sumF(person.colorScores)
  };
};

/*
   These types are used in various parts of the rest of the app. They map to:
   - What tiebreak function to use.
   - What tiebreak value has been computed for a player.
   - What human-language name to display for the tiebreak.
   - How to encode or decode a reference to a tiebreak for JS.
   Since they're responsible for a lot of work, I'll leave that work for mapping
   functions and keep these types opaque.
 */
type tieBreak =
  | Median
  | Solkoff
  | Cumulative
  | CumulativeOfOpposition
  | MostBlack;

let mapTieBreak = tieBreak =>
  switch (tieBreak) {
  | Median => getMedianScore
  | Solkoff => getSolkoffScore
  | Cumulative => getCumulativeScore
  | CumulativeOfOpposition => getCumulativeOfOpponentScore
  | MostBlack => getColorBalanceScore
  };

type standing = {
  id: string,
  score: float,
  tieBreaks: list((tieBreak, float)),
};

let standingsSorter = (tieBreaks, a, b) => {
  let result = ref(0);
  let tieBreakIndex = ref(0);
  let break = ref(false);
  while (result^ === 0 && ! break^) {
    switch (tieBreaks->Array.get(tieBreakIndex^)) {
    | None => break := true
    | Some(tieBreak) =>
      let getTieBreak = List.getAssoc(_, tieBreak, (===));
      switch (compare(b.score, a.score)) {
      | 0 =>
        switch (getTieBreak(b.tieBreaks), getTieBreak(a.tieBreaks)) {
        | (Some(tb_b), Some(tb_a)) =>
          switch (compare(tb_b, tb_a)) {
          | 0 => tieBreakIndex := tieBreakIndex^ + 1
          | x => result := x
          }
        | (None, _)
        | (_, None) => break := true
        }
      | x => result := x
      };
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
let createStandingList = (scoreData, methods) => {
  let selectedTieBreakFuncs =
    methods
    ->List.fromArray
    ->List.map(tbType => (tbType, mapTieBreak(tbType)));
  scoreData
  ->Map.String.reduce([], (acc, id, data) =>
      [
        {
          id,
          score: Utils.List.sumF(data.results),
          tieBreaks:
            selectedTieBreakFuncs->List.map(((tbType, fn)) =>
              (tbType, fn(scoreData, id))
            ),
        },
        ...acc,
      ]
    )
  /* The `reverse` just ensures that ties are sorted according to their original
     order (alphabetically by name) and not reversed. It has no practical
     purpose and should probably be replaced with a more robust sorting option
     */
  ->List.reverse
  ->List.sort(standingsSorter(methods));
};

let areScoresEqual = (standing1, standing2) =>
  if (standing1.score !== standing2.score) {
    false;
  } else {
    !
      standing1.tieBreaks
      ->List.reduce([], (acc, (id, value)) =>
          switch (standing2.tieBreaks->List.getAssoc(id, (===))) {
          | Some(value2) => [value !== value2, ...acc]
          | None => acc
          }
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