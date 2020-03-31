open Belt;

module Color = {
  type t =
    | White
    | Black;

  let opposite =
    fun
    | White => Black
    | Black => White;

  let toScore =
    fun
    | White => (-1.0)
    | Black => 1.0;
};

type t = {
  colorScores: list(float),
  colors: list(Color.t), /* This is used to create pairing data*/
  id: Data_Id.t,
  isDummy: bool,
  opponentResults: Data_Id.Map.t(float),
  ratings: list(int),
  firstRating: int,
  results: list(float),
  resultsNoByes: list(float),
};

module TieBreak = {
  type t =
    | Median
    | Solkoff
    | Cumulative
    | CumulativeOfOpposition
    | MostBlack;

  let toString = data =>
    switch (data) {
    | Median => "median"
    | Solkoff => "solkoff"
    | Cumulative => "cumulative"
    | CumulativeOfOpposition => "cumulativeOfOpposition"
    | MostBlack => "mostBlack"
    };

  let toPrettyString = tieBreak =>
    switch (tieBreak) {
    | Median => "Median"
    | Solkoff => "Solkoff"
    | Cumulative => "Cumulative"
    | CumulativeOfOpposition => "Cumulative of opposition"
    | MostBlack => "Most Black"
    };

  let fromString = json =>
    switch (json) {
    | "median" => Median
    | "solkoff" => Solkoff
    | "cumulative" => Cumulative
    | "cumulativeOfOpposition" => CumulativeOfOpposition
    | "mostBlack" => MostBlack
    | _ => Median
    };

  let encode = data => data->toString->Json.Encode.string;

  let decode = json => json->Json.Decode.string->fromString;
};

let createBlankScoreData = (~firstRating=0, id) => {
  colorScores: [],
  colors: [],
  id,
  isDummy: false,
  opponentResults: Data_Id.Map.make(),
  ratings: [],
  firstRating,
  results: [],
  resultsNoByes: [],
};

let isNotDummy = (scores, oppId) => {
  switch (Map.get(scores, oppId)) {
  | None => true
  | Some(opponent) => !opponent.isDummy
  };
};

let getPlayerScore = (scores, id) => {
  switch (Map.get(scores, id)) {
  | None => 0.0
  | Some({results, _}) => Utils.List.sumF(results)
  };
};

let getOpponentScores = (scores, id) => {
  switch (Map.get(scores, id)) {
  | None => []
  | Some({opponentResults, _}) =>
    Map.reduce(opponentResults, [], (acc, oppId, _) =>
      if (isNotDummy(scores, oppId)) {
        [getPlayerScore(scores, oppId), ...acc];
      } else {
        acc;
      }
    )
  };
};

/**
 * USCF § 34E1
 */
let getMedianScore = (scores, id) =>
  scores
  ->getOpponentScores(id)
  ->List.sort(compare)
  ->List.tail
  ->Option.mapWithDefault([], List.reverse)
  ->List.tail
  ->Option.mapWithDefault(0.0, Utils.List.sumF);

/**
 * USCF § 34E2.
 */
let getSolkoffScore = (scores, id) =>
  scores->getOpponentScores(id)->Utils.List.sumF;

/**
 * Turn the regular score list into a "running" score list.
 */
let runningReducer = (acc, score) =>
  switch (acc) {
  | [last, ...rest] => [last +. score, last, ...rest]
  | [] => [score]
  };

/**
 * USCF § 34E3.
 */
let getCumulativeScore = (scores, id) => {
  switch (Map.get(scores, id)) {
  | None => 0.0
  | Some({resultsNoByes, _}) =>
    resultsNoByes->List.reduce([], runningReducer)->Utils.List.sumF
  };
};

/**
 * USCF § 34E4.
 */
let getCumulativeOfOpponentScore = (scores, id) => {
  switch (Map.get(scores, id)) {
  | None => 0.0
  | Some({opponentResults, _}) =>
    Map.reduce(opponentResults, [], (acc, key, _) =>
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

/**
 * USCF § 34E6.
 */
let getColorBalanceScore = (scores, id) => {
  switch (Map.get(scores, id)) {
  | None => 0.0
  | Some({colorScores, _}) => Utils.List.sumF(colorScores)
  };
};

let mapTieBreak =
  fun
  | TieBreak.Median => getMedianScore
  | TieBreak.Solkoff => getSolkoffScore
  | TieBreak.Cumulative => getCumulativeScore
  | TieBreak.CumulativeOfOpposition => getCumulativeOfOpponentScore
  | TieBreak.MostBlack => getColorBalanceScore;

type scores = {
  id: Data_Id.t,
  score: float,
  tieBreaks: list((TieBreak.t, float)),
};

/**
 * `a` and `b` have a list of tiebreak results. `tieBreaks` is a list of what
 * tiebreak results to sort by, and in what order. It is expected that `a` and
 *`b` will have a result for every item in `tieBreaks`.
 */
let standingsSorter = (tieBreaks, a, b) => {
  let rec tieBreaksCompare = tieBreaks => {
    switch (tieBreaks) {
    | [] => 0
    | [tieBreak, ...rest] =>
      let getTieBreak = List.getAssoc(_, tieBreak, (===));
      switch (getTieBreak(a.tieBreaks), getTieBreak(b.tieBreaks)) {
      | (None, _)
      | (_, None) => tieBreaksCompare(rest)
      | (Some(tb_a), Some(tb_b)) =>
        /* a and b are switched for ascending order */
        switch (compare(tb_b, tb_a)) {
        | 0 => tieBreaksCompare(rest)
        | x => x
        }
      };
    };
  };
  /* a and b are switched for ascending order */
  switch (compare(b.score, a.score)) {
  | 0 => tieBreaksCompare(tieBreaks)
  | x => x
  };
};

/*
   This is not used. It is preserved for reference purposes.
 */
/*
 let standingsSorter_old = (tieBreaks: array(tieBreak), a: scores, b: scores) => {
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
 }; */

let createStandingList = (scores, methods) => {
  let funcList =
    methods
    ->List.fromArray
    ->List.map(tbType => (tbType, mapTieBreak(tbType)));
  Map.reduce(scores, [], (acc, id, data) =>
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
  ->List.sort(standingsSorter(List.fromArray(methods)));
};

let areScoresEqual = (standing1, standing2) =>
  if (standing1.score !== standing2.score) {
    false;
  } else {
    let comparisons =
      List.reduce(standing1.tieBreaks, [], (acc, (id, value)) =>
        switch (List.getAssoc(standing2.tieBreaks, id, (===))) {
        | Some(value2) => [value !== value2, ...acc]
        | None => acc
        }
      );
    !List.has(comparisons, true, (===));
  };

let createStandingTree = (standingList: list(scores)) =>
  List.reduce(standingList, [], (acc, standing) =>
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
  module EloRank = {
    type t = int;

    let getExpected = (a: int, b: int) =>
      1. /. (1. +. 10. ** (Float.fromInt(b - a) /. 400.));

    let updateRating = (rating, expected, actual, current) =>
      Float.fromInt(current)
      +. Float.fromInt(rating)
      *. (actual -. expected)
      |> Js.Math.round
      |> Int.fromFloat;

    let getKFactor = (~matchCount) => {
      let ne = matchCount > 0 ? matchCount : 1;
      800 / ne;
    };
  };

  let floor = 100;

  let keepAboveFloor = rating => rating > floor ? rating : floor;

  let calcNewRatings =
      (
        ~whiteRating,
        ~blackRating,
        ~whiteMatchCount,
        ~blackMatchCount,
        ~result,
      ) => {
    let whiteElo = EloRank.getKFactor(~matchCount=whiteMatchCount);
    let blackElo = EloRank.getKFactor(~matchCount=blackMatchCount);
    let whiteExpected = EloRank.getExpected(whiteRating, blackRating);
    let blackExpected = EloRank.getExpected(blackRating, whiteRating);
    let whiteResult = Data_Match.Result.(toFloat(result, White));
    let blackResult = Data_Match.Result.(toFloat(result, Black));
    (
      EloRank.updateRating(whiteElo, whiteExpected, whiteResult, whiteRating)
      ->keepAboveFloor,
      EloRank.updateRating(blackElo, blackExpected, blackResult, blackRating)
      ->keepAboveFloor,
    );
  };
};
