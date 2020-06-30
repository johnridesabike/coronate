open Belt;
module Id = Data_Id;

module Score = {
  module Sum: {
    type t;
    let zero: t;
    let add: (t, t) => t;
    let compare: (t, t) => int;
    let eq: (t, t) => bool;
    let sum: list(t) => t;
    let fromFloat: float => t;
    let toFloat: t => float;
    let toNumeral: t => Numeral.t;
    let calcScore: (list(t), ~adjustment: float) => t;
  } = {
    type t = float;
    let zero = 0.0;
    let add = (+.);
    let compare: (t, t) => int = compare;
    let eq: (t, t) => bool = (==);
    let sum = list => List.reduce(list, zero, add);
    let fromFloat = x => x;
    let toFloat = x => x;
    let toNumeral = Numeral.make;
    let calcScore = (results, ~adjustment) =>
      add(sum(results), fromFloat(adjustment));
  };

  type t =
    | Zero
    | One
    | NegOne
    | Half;

  let toFloat =
    fun
    | Zero => 0.0
    | One => 1.0
    | NegOne => (-1.0)
    | Half => 0.5;

  let toSum = x => x->toFloat->Sum.fromFloat;

  let add = (a, b) => Sum.add(a, toSum(b));
  let sum = list => List.reduce(list, Sum.zero, add);
  let calcScore = (results, ~adjustment) =>
    Sum.add(sum(results), Sum.fromFloat(adjustment));
};

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
    | White => Score.NegOne
    | Black => Score.One;
};

type t = {
  colorScores: list(Score.t),
  colors: list(Color.t), /* This is used to create pairing data*/
  id: Id.t,
  isDummy: bool,
  opponentResults: list((Id.t, Score.t)),
  ratings: list(int),
  firstRating: int,
  results: list(Score.t),
  resultsNoByes: list(Score.t),
  adjustment: float,
};

let oppResultsToSumById = ({opponentResults, _}, id) =>
  List.reduce(opponentResults, None, (acc, (id', result)) =>
    if (Id.eq(id, id')) {
      switch (acc) {
      | Some(acc) => Some(Score.add(acc, result))
      | None => Some(Score.add(Score.Sum.zero, result))
      };
    } else {
      acc;
    }
  );

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

  let eq = (a, b) =>
    switch (a, b) {
    | (Median, Median)
    | (Solkoff, Solkoff)
    | (Cumulative, Cumulative)
    | (CumulativeOfOpposition, CumulativeOfOpposition)
    | (MostBlack, MostBlack) => true
    | (
        Median | Solkoff | Cumulative | CumulativeOfOpposition | MostBlack,
        Median | Solkoff | Cumulative | CumulativeOfOpposition | MostBlack,
      ) =>
      false
    };
};

let createBlankScoreData = (~firstRating=0, id) => {
  colorScores: [],
  colors: [],
  id,
  isDummy: false,
  opponentResults: [],
  ratings: [],
  firstRating,
  results: [],
  resultsNoByes: [],
  adjustment: 0.0,
};

let isNotDummy = (scores, oppId) => {
  switch (Map.get(scores, oppId)) {
  | None => true
  | Some(opponent) => !opponent.isDummy
  };
};

let getPlayerScore = (scores, id) => {
  switch (Map.get(scores, id)) {
  | None => Score.Sum.zero
  | Some({results, adjustment, _}) => Score.calcScore(results, ~adjustment)
  };
};

let getOpponentScores = (scores, id) => {
  switch (Map.get(scores, id)) {
  | None => []
  | Some({opponentResults, _}) =>
    List.reduce(opponentResults, [], (acc, (oppId, _)) =>
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
  ->List.sort(Score.Sum.compare)
  ->List.tail
  ->Option.mapWithDefault([], List.reverse)
  ->List.tail
  ->Option.mapWithDefault(Score.Sum.zero, Score.Sum.sum);

/**
 * USCF § 34E2.
 */
let getSolkoffScore = (scores, id) =>
  scores->getOpponentScores(id)->Score.Sum.sum;

/**
 * Turn the regular score list into a "running" score list.
 */
let runningReducer = (acc, score) =>
  switch (acc) {
  | [last, ...rest] => [
      Score.Sum.add(last, Score.toSum(score)),
      last,
      ...rest,
    ]
  | [] => [score->Score.toSum]
  };

/**
 * USCF § 34E3.
 */
let getCumulativeScore = (scores, id) => {
  switch (Map.get(scores, id)) {
  | None => Score.Sum.zero
  | Some({resultsNoByes, adjustment, _}) =>
    resultsNoByes
    ->List.reduce([], runningReducer)
    ->Score.Sum.calcScore(~adjustment)
  };
};

/**
 * USCF § 34E4.
 */
let getCumulativeOfOpponentScore = (scores, id) => {
  switch (Map.get(scores, id)) {
  | None => Score.Sum.zero
  | Some({opponentResults, _}) =>
    List.reduce(opponentResults, [], (acc, (key, _)) =>
      if (isNotDummy(scores, key)) {
        [key, ...acc];
      } else {
        acc;
      }
    )
    ->List.map(getCumulativeScore(scores))
    ->Score.Sum.sum
  };
};

/**
 * USCF § 34E6.
 */
let getColorBalanceScore = (scores, id) => {
  switch (Map.get(scores, id)) {
  | None => Score.Sum.zero
  | Some({colorScores, _}) => Score.sum(colorScores)
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
  id: Id.t,
  score: Score.Sum.t,
  tieBreaks: list((TieBreak.t, Score.Sum.t)),
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
      let getTieBreak = List.getAssoc(_, tieBreak, TieBreak.eq);
      switch (getTieBreak(a.tieBreaks), getTieBreak(b.tieBreaks)) {
      | (None, _)
      | (_, None) => tieBreaksCompare(rest)
      | (Some(tb_a), Some(tb_b)) =>
        /* a and b are switched for ascending order */
        switch (Score.Sum.compare(tb_b, tb_a)) {
        | 0 => tieBreaksCompare(rest)
        | x => x
        }
      };
    };
  };
  /* a and b are switched for ascending order */
  switch (Score.Sum.compare(b.score, a.score)) {
  | 0 => tieBreaksCompare(tieBreaks)
  | x => x
  };
};

let createStandingList = (scores, methods) => {
  let funcList =
    methods
    ->List.fromArray
    ->List.map(tbType => (tbType, mapTieBreak(tbType)));
  Map.reduce(scores, [], (acc, id, {results, adjustment, _}) =>
    [
      {
        id,
        score: Score.calcScore(results, ~adjustment),
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
  if (!Score.Sum.eq(standing1.score, standing2.score)) {
    false;
  } else {
    let comparisons =
      List.reduce(standing1.tieBreaks, [], (acc, (id, value)) =>
        switch (List.getAssoc(standing2.tieBreaks, id, TieBreak.eq)) {
        | Some(value2) => [!Score.Sum.eq(value, value2), ...acc]
        | None => acc
        }
      );
    !List.has(comparisons, true, (==));
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
