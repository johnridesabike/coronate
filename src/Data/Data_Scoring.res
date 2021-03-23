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

  let fromResultWhite = (x: Data_Match.Result.t) =>
    switch x {
    | WhiteWon => One
    | BlackWon => Zero
    | Draw => Half
    /* This loses data, so is a one-way trip. Use with prudence! */
    | NotSet => Zero
    }

  let fromResultBlack = (x: Data_Match.Result.t) =>
    switch x {
    | WhiteWon => Zero
    | BlackWon => One
    | Draw => Half
    /* This loses data, so is a one-way trip. Use with prudence! */
    | NotSet => Zero
    }
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
  lastColor: option<Color.t>, // This is used to create pairing data
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
}

let make = id => {
  colorScores: list{},
  lastColor: None,
  id: id,
  isDummy: false,
  opponentResults: list{},
  ratings: list{},
  firstRating: 0,
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
    ->List.keepMap(((id, _)) =>
      isNotDummy(scores, id) ? Some(getCumulativeScore(scores, id)) : None
    )
    ->Score.Sum.sum
  }

@ocaml.doc("USCF § 34E6.")
let getColorBalanceScore = (scores, id) =>
  switch Map.get(scores, id) {
  | None => Score.Sum.zero
  | Some({colorScores, _}) => Score.sum(colorScores)
  }

type scores = {
  id: Data_Id.t,
  score: Score.Sum.t,
  median: Score.Sum.t,
  solkoff: Score.Sum.t,
  cumulative: Score.Sum.t,
  cumulativeOfOpposition: Score.Sum.t,
  mostBlack: Score.Sum.t,
}

let getTieBreak = (scores, x: TieBreak.t) =>
  switch x {
  | Median => scores.median
  | Solkoff => scores.solkoff
  | Cumulative => scores.cumulative
  | CumulativeOfOpposition => scores.cumulativeOfOpposition
  | MostBlack => scores.mostBlack
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
      switch (getTieBreak(a, tieBreak), getTieBreak(b, tieBreak)) {
      | (a', b') =>
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

let createStandingArray = (t, orderedMethods) =>
  t
  // Tiebreaks are computed even if they aren't necessary.
  // If this is a performance problem, they could be wrapped in a lazy type.
  ->Map.map(({id, results, adjustment, _}) => {
    id: id,
    score: Score.calcScore(results, ~adjustment),
    median: getMedianScore(t, id),
    solkoff: getSolkoffScore(t, id),
    cumulative: getCumulativeScore(t, id),
    cumulativeOfOpposition: getCumulativeOfOpponentScore(t, id),
    mostBlack: getColorBalanceScore(t, id),
  })
  ->Map.valuesToArray
  ->SortArray.stableSortBy(standingsSorter(orderedMethods))

let eq = (a, b, tieBreaks) =>
  Score.Sum.eq(a.score, b.score) &&
  Array.every(tieBreaks, tb => Score.Sum.eq(getTieBreak(a, tb), getTieBreak(b, tb)))

let createStandingTree = (standingArray, ~tieBreaks) =>
  Array.reduce(standingArray, list{}, (tree, standing) =>
    switch tree {
    /* Always make a new rank for the first player */
    | list{} => list{list{standing}}
    | list{treeHead, ...treeTail} =>
      switch treeHead {
      | list{} => list{list{standing}, ...tree}
      /* Make a new rank if the scores aren't equal */
      | list{lastStanding, ..._} if !eq(lastStanding, standing, tieBreaks) => list{
          list{standing},
          treeHead,
          ...treeTail,
        }
      | _ => list{list{standing, ...treeHead}, ...treeTail}
      }
    }
  )

let update = (
  data,
  ~playerId,
  ~origRating,
  ~newRating,
  ~result,
  ~oppId,
  ~color,
  ~scoreAdjustments,
) =>
  switch data {
  | None =>
    Some({
      id: playerId,
      firstRating: origRating,
      adjustment: Map.getWithDefault(scoreAdjustments, playerId, 0.0),
      results: list{result},
      resultsNoByes: Data_Id.isDummy(oppId) ? list{} : list{result},
      lastColor: Some(color),
      colorScores: list{Color.toScore(color)},
      opponentResults: list{(oppId, result)},
      ratings: list{newRating},
      isDummy: Data_Id.isDummy(playerId),
    })
  | Some(data) =>
    Some({
      ...data,
      results: list{result, ...data.results},
      resultsNoByes: Data_Id.isDummy(oppId)
        ? data.resultsNoByes
        : list{result, ...data.resultsNoByes},
      lastColor: Some(color),
      colorScores: list{Color.toScore(color), ...data.colorScores},
      opponentResults: list{(oppId, result), ...data.opponentResults},
      ratings: list{newRating, ...data.ratings},
    })
  }

let fromTournament = (~roundList, ~scoreAdjustments) =>
  roundList
  ->Data_Rounds.rounds2Matches
  ->MutableQueue.reduce(Map.make(~id=Data_Id.id), (acc, match: Data_Match.t) =>
    switch match.result {
    | NotSet => acc
    | WhiteWon | BlackWon | Draw =>
      let whiteUpdate = update(
        ~playerId=match.whiteId,
        ~origRating=match.whiteOrigRating,
        ~newRating=match.whiteNewRating,
        ~result=Score.fromResultWhite(match.result),
        ~oppId=match.blackId,
        ~color=White,
        ~scoreAdjustments,
      )
      let blackUpdate = update(
        ~playerId=match.blackId,
        ~origRating=match.blackOrigRating,
        ~newRating=match.blackNewRating,
        ~result=Score.fromResultBlack(match.result),
        ~oppId=match.whiteId,
        ~color=Black,
        ~scoreAdjustments,
      )
      acc->Map.update(match.whiteId, whiteUpdate)->Map.update(match.blackId, blackUpdate)
    }
  )
