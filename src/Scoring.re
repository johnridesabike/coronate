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
  /* This is used for calculating the "most black" tiebreak. */
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

let isNotDummy = (scores, oppId) => {
  switch (scores->Map.String.get(oppId)) {
  | None => true
  | Some(opponent) => !opponent.isDummy
  };
};

let getPlayerScore = (scores, id) => {
  switch (scores->Map.String.get(id)) {
  | None => 0.0
  | Some({results}) => Utils.List.sumF(results)
  };
};

let getOpponentScores = (scores, id) => {
  switch (scores->Map.String.get(id)) {
  | None => []
  | Some({opponentResults}) =>
    opponentResults->Map.String.reduce([], (acc, oppId, _) =>
      if (isNotDummy(scores, oppId)) {
        [getPlayerScore(scores, oppId), ...acc];
      } else {
        acc;
      }
    )
  };
};

/* USCF § 34E1 */
let getMedianScore = (scores, id) =>
  scores
  ->getOpponentScores(id)
  ->List.sort(compare)
  ->List.tail
  ->Option.mapWithDefault([], List.reverse)
  ->List.tail
  ->Option.mapWithDefault(0.0, Utils.List.sumF);

/* USCF § 34E2.*/
let getSolkoffScore = (scores, id) =>
  scores->getOpponentScores(id)->Utils.List.sumF;

/* turn the regular score list into a "running" score list */
let runningReducer = (acc, score) =>
  switch (acc) {
  | [last, ...rest] => [last +. score, last, ...rest]
  | [] => [score]
  };

/* USCF § 34E3.*/
let getCumulativeScore = (scores, id) => {
  switch (scores->Map.String.get(id)) {
  | None => 0.0
  | Some({resultsNoByes}) =>
    resultsNoByes->List.reduce([], runningReducer)->Utils.List.sumF
  };
};

/* USCF § 34E4.*/
let getCumulativeOfOpponentScore = (scores, id) => {
  switch (scores->Map.String.get(id)) {
  | None => 0.0
  | Some({opponentResults}) =>
    opponentResults
    ->Map.String.reduce([], (acc, key, _) =>
        if (isNotDummy(scores, key)) {
          [key, ...acc];
        } else {
          acc;
        }
      )
    ->List.map(getCumulativeScore(scores))
    ->Utils.List.sumF
  };
};

/* USCF § 34E6. */
let getColorBalanceScore = (scores, id) => {
  switch (scores->Map.String.get(id)) {
  | None => 0.0
  | Some({colorScores}) => Utils.List.sumF(colorScores)
  };
};

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

/*
   `a` and `b` have a list of tiebreak results. `tieBreaks` is an array of what
   tiebreak results to sort by, and in what order. It is expected that `a` and
   `b` will have a result for every item in `tieBreaks`.
 */
let standingsSorter = (tieBreaks: array(tieBreak), a: standing, b: standing) => {
  let rec tieBreaksCompare = (index: int) => {
    switch (tieBreaks->Array.get(index)) {
    | None => 0
    | Some(tieBreak) =>
      let getTieBreak = List.getAssoc(_, tieBreak, (===));
      switch (getTieBreak(a.tieBreaks), getTieBreak(b.tieBreaks)) {
      | (None, _)
      | (_, None) => tieBreaksCompare(index + 1)
      | (Some(tb_a), Some(tb_b)) =>
        /* a and b are switched for ascending order */
        switch (compare(tb_b, tb_a)) {
        | 0 => tieBreaksCompare(index + 1)
        | x => x
        }
      };
    };
  };
  /* a and b are switched for ascending order */
  switch (compare(b.score, a.score)) {
  | 0 => tieBreaksCompare(0)
  | x => x
  };
};

/*
   This is not used but is being preserved for reference purposes.
 */
/*
 let standingsSorter_old = (tieBreaks, a, b) => {
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
         | (_, None) => () /* Nothing happens. Should there be an error? */
         }
       | x => result := x
       };
     };
   };
   result^;
 };
  */
/*
 Sort the standings by score, see USCF tie-break rules from § 34.
 Returns the list of the standings. Each standing has a `tieBreaks` property
 which lists the score associated with each method. The order of these
 coresponds to the order of the method names in the second list.
 */
let createStandingList = (scores, methods) => {
  let funcList =
    methods
    ->List.fromArray
    ->List.map(tbType => (tbType, mapTieBreak(tbType)));
  scores
  ->Map.String.reduce([], (acc, id, data) =>
      [
        {
          id,
          score: Utils.List.sumF(data.results),
          tieBreaks:
            funcList->List.map(((tbType, fn)) => (tbType, fn(scores, id))),
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
    let comparisons =
      standing1.tieBreaks
      ->List.reduce([], (acc, (id, value)) =>
          switch (standing2.tieBreaks->List.getAssoc(id, (===))) {
          | Some(value2) => [value !== value2, ...acc]
          | None => acc
          }
        );
    !comparisons->List.has(true, (===));
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