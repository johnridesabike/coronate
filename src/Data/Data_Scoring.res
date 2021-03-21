open Belt
module Id = Data_Id

module Score = {
  module Sum: {
    type t
    let zero: t
    let add: (t, t) => t
    let compare: (t, t) => int
    let eq: (t, t) => bool
    let sum: list<t> => t
    let fromFloat: float => t
    let toFloat: t => float
    let toNumeral: t => Numeral.t
    let calcScore: (list<t>, ~adjustment: float) => t
  } = {
    type t = float
    let zero = 0.0
    let add = (a, b) => a +. b
    let compare: (t, t) => int = compare
    let eq: (t, t) => bool = (a, b) => a == b
    let sum = list => List.reduce(list, zero, add)
    let fromFloat = x => x
    let toFloat = x => x
    let toNumeral = Numeral.make
    let calcScore = (results, ~adjustment) => add(sum(results), fromFloat(adjustment))
  }

  type t = Zero | One | NegOne | Half

  let toFloat = x =>
    switch x {
    | Zero => 0.0
    | One => 1.0
    | NegOne => -1.0
    | Half => 0.5
    }

  let toSum = x => x->toFloat->Sum.fromFloat

  let add = (a, b) => Sum.add(a, toSum(b))
  let sum = list => List.reduce(list, Sum.zero, add)
  let calcScore = (results, ~adjustment) => Sum.add(sum(results), Sum.fromFloat(adjustment))
}

module Color = {
  type t =
    | White
    | Black

  let opposite = x =>
    switch x {
    | White => Black
    | Black => White
    }

  let toScore = (x): Score.t =>
    switch x {
    | White => NegOne
    | Black => One
    }
}

type t = {
  colorScores: list<Score.t>,
  colors: list<Color.t> /* This is used to create pairing data */,
  id: Id.t,
  isDummy: bool,
  opponentResults: list<(Id.t, Score.t)>,
  ratings: list<int>,
  firstRating: int,
  results: list<Score.t>,
  resultsNoByes: list<Score.t>,
  adjustment: float,
}

let oppResultsToSumById = ({opponentResults, _}, id) =>
  List.reduce(opponentResults, None, (acc, (id', result)) =>
    if Id.eq(id, id') {
      switch acc {
      | Some(acc) => Some(Score.add(acc, result))
      | None => Some(Score.add(Score.Sum.zero, result))
      }
    } else {
      acc
    }
  )

module TieBreak = {
  type t =
    | Median
    | Solkoff
    | Cumulative
    | CumulativeOfOpposition
    | MostBlack

  let toString = data =>
    switch data {
    | Median => "median"
    | Solkoff => "solkoff"
    | Cumulative => "cumulative"
    | CumulativeOfOpposition => "cumulativeOfOpposition"
    | MostBlack => "mostBlack"
    }

  module Cmp = unpack(Belt.Id.comparable(~cmp=(a: t, b: t) => compare(a, b)))

  type identity = Cmp.identity

  let toPrettyString = tieBreak =>
    switch tieBreak {
    | Median => "Median"
    | Solkoff => "Solkoff"
    | Cumulative => "Cumulative"
    | CumulativeOfOpposition => "Cumulative of opposition"
    | MostBlack => "Most Black"
    }

  let fromString = json =>
    switch json {
    | "median" => Median
    | "solkoff" => Solkoff
    | "cumulative" => Cumulative
    | "cumulativeOfOpposition" => CumulativeOfOpposition
    | "mostBlack" => MostBlack
    | _ => Median
    }

  let encode = data => data->toString->Json.Encode.string

  let decode = json => json->Json.Decode.string->fromString

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
      ) => false
    }
}

let createBlankScoreData = (~firstRating=0, id) => {
  colorScores: list{},
  colors: list{},
  id: id,
  isDummy: false,
  opponentResults: list{},
  ratings: list{},
  firstRating: firstRating,
  results: list{},
  resultsNoByes: list{},
  adjustment: 0.0,
}

let isNotDummy = (scores, oppId) =>
  switch Map.get(scores, oppId) {
  | None => true
  | Some(opponent) => !opponent.isDummy
  }

let getPlayerScore = (scores, id) =>
  switch Map.get(scores, id) {
  | None => Score.Sum.zero
  | Some({results, adjustment, _}) => Score.calcScore(results, ~adjustment)
  }

let getOpponentScores = (scores, id) =>
  switch Map.get(scores, id) {
  | None => list{}
  | Some({opponentResults, _}) =>
    List.keepMap(opponentResults, ((oppId, _)) =>
      isNotDummy(scores, oppId) ? Some(getPlayerScore(scores, oppId)) : None
    )
  }

@ocaml.doc("USCF § 34E1")
let getMedianScore = (scores, id) => {
  let oppScores = scores->getOpponentScores(id)
  let size = List.size(oppScores)
  oppScores
  ->List.sort(Score.Sum.compare)
  // Remove the highest and lowest scores.
  ->List.keepWithIndex((_, i) => !(i == 0 || i == size - 1))
  ->Score.Sum.sum
}

@ocaml.doc("USCF § 34E2.")
let getSolkoffScore = (scores, id) => scores->getOpponentScores(id)->Score.Sum.sum

@ocaml.doc("Turn the regular score list into a \"running\" score list.")
let runningReducer = (acc, score) =>
  switch acc {
  | list{} => list{Score.toSum(score)}
  | list{last, ...rest} => list{Score.Sum.add(last, Score.toSum(score)), last, ...rest}
  }

@ocaml.doc("USCF § 34E3.")
let getCumulativeScore = (scores, id) =>
  switch Map.get(scores, id) {
  | None => Score.Sum.zero
  | Some({resultsNoByes, adjustment, _}) =>
    resultsNoByes->List.reduce(list{}, runningReducer)->Score.Sum.calcScore(~adjustment)
  }

@ocaml.doc("USCF § 34E4.")
let getCumulativeOfOpponentScore = (scores, id) =>
  switch Map.get(scores, id) {
  | None => Score.Sum.zero
  | Some({opponentResults, _}) =>
    opponentResults
    ->List.keepMap(((key, _)) => isNotDummy(scores, key) ? Some(key) : None)
    ->List.map(getCumulativeScore(scores))
    ->Score.Sum.sum
  }

@ocaml.doc("USCF § 34E6.")
let getColorBalanceScore = (scores, id) =>
  switch Map.get(scores, id) {
  | None => Score.Sum.zero
  | Some({colorScores, _}) => Score.sum(colorScores)
  }

let mapTieBreak = (x: TieBreak.t) =>
  switch x {
  | Median => getMedianScore
  | Solkoff => getSolkoffScore
  | Cumulative => getCumulativeScore
  | CumulativeOfOpposition => getCumulativeOfOpponentScore
  | MostBlack => getColorBalanceScore
  }

type scores = {
  id: Id.t,
  score: Score.Sum.t,
  tieBreaks: Map.t<TieBreak.t, Score.Sum.t, TieBreak.identity>,
}

@ocaml.doc("
 `a` and `b` have a list of tiebreak results. `tieBreaks` is a list of what
 tiebreak results to sort by, and in what order. It is expected that `a` and
 b` will have a result for every item in `tieBreaks`.
 ")
let standingsSorter = (orderedMethods, a, b) => {
  let rec tieBreaksCompare = i =>
    switch orderedMethods[i] {
    | None => 0
    | Some(tieBreak) =>
      switch (Map.get(a.tieBreaks, tieBreak), Map.get(b.tieBreaks, tieBreak)) {
      | (None, _) | (_, None) => tieBreaksCompare(succ(i))
      | (Some(a'), Some(b')) =>
        /* a and b are switched for ascending order */
        switch Score.Sum.compare(b', a') {
        | 0 => tieBreaksCompare(succ(i))
        | x => x
        }
      }
    }
  /* a and b are switched for ascending order */
  switch Score.Sum.compare(b.score, a.score) {
  | 0 => tieBreaksCompare(0)
  | x => x
  }
}

let createStandingArray = (scores, orderedMethods) => {
  let funcMap = Array.reduce(orderedMethods, Map.make(~id=module(TieBreak.Cmp)), (acc, tbType) =>
    Map.set(acc, tbType, mapTieBreak(tbType))
  )
  scores
  ->Map.map(({id, results, adjustment, _}) => {
    id: id,
    score: Score.calcScore(results, ~adjustment),
    tieBreaks: Map.map(funcMap, fn => fn(scores, id)),
  })
  ->Map.valuesToArray
  ->SortArray.stableSortBy(standingsSorter(orderedMethods))
}

let areScoresEqual = (a, b) =>
  Score.Sum.eq(a.score, b.score) && Map.eq(a.tieBreaks, b.tieBreaks, Score.Sum.eq)

let createStandingTree = standingArray =>
  Array.reduce(standingArray, list{}, (acc, standing) =>
    switch acc {
    /* Always make a new rank for the first player */
    | list{} => list{list{standing}}
    | list{lastRank, ...pastRanks} =>
      switch lastRank {
      | list{} => list{list{standing}, ...acc}
      | list{lastStanding, ..._} =>
        /* Make a new rank if the scores aren't equal */
        if !areScoresEqual(lastStanding, standing) {
          list{list{standing}, lastRank, ...pastRanks}
        } else {
          list{list{standing, ...lastRank}, ...pastRanks}
        }
      }
    }
  )
