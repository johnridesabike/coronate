@ocaml.doc("
 This handles all of the score tiebreak logic. Not all of the USCF methods
 are implemented yet, just the most common ones.
 ")
module Score: {
  @ocaml.doc("
    This manages the floating-point sum of individual match scores.
   ")
  module Sum: {
    type t
    let toFloat: t => float
    let toNumeral: t => Numeral.t
  }

  type t =
    | Zero
    | One
    | NegOne
    | Half

  let sum: list<t> => Sum.t
  let calcScore: (list<t>, ~adjustment: float) => Sum.t
  let toFloat: t => float
}

module Color: {
  type t =
    | White
    | Black

  let opposite: t => t

  @ocaml.doc("
   This is used for calculating the \"most black\" tiebreak.
   ")
  let toScore: t => Score.t
}

type t = {
  colorScores: list<Score.t>,
  colors: list<Color.t> /* This is used to create pairing data */,
  id: Data_Id.t,
  isDummy: bool,
  opponentResults: list<(Data_Id.t, Score.t)>,
  ratings: list<int>,
  firstRating: int,
  results: list<Score.t>,
  resultsNoByes: list<Score.t>,
  adjustment: float,
}

let oppResultsToSumById: (t, Data_Id.t) => option<Score.Sum.t>

module TieBreak: {
  @ocaml.doc("
   These types are used in various parts of the rest of the app. They map to:
   - What tiebreak function to use.
   - What tiebreak value has been computed for a player.
   - What human-language name to display for the tiebreak.
   - How to encode or decode a reference to a tiebreak for JS.
   Since they're responsible for a lot of work, I'll leave that work for
   mapping functions and keep these types opaque.
   ")
  type t =
    | Median
    | Solkoff
    | Cumulative
    | CumulativeOfOpposition
    | MostBlack

  let encode: t => Js.Json.t

  let decode: Js.Json.t => t

  let toString: t => string

  let toPrettyString: t => string

  let eq: (t, t) => bool
}

@ocaml.doc("
 This is useful for cases where the regular factory functions return empty
 results because a player hasn't been added yet.
 ")
let createBlankScoreData: (~firstRating: int=?, Data_Id.t) => t

type scores = {
  id: Data_Id.t,
  score: Score.Sum.t,
  tieBreaks: list<(TieBreak.t, Score.Sum.t)>,
}

@ocaml.doc("
 Sort the standings by score, see USCF tie-break rules from § 34.
 Returns the list of the standings. Each standing has a `tieBreaks` property
 which lists the score associated with each method. The order of these
 coresponds to the order of the method names in the second list.
 ")
let createStandingList: (Data_Id.Map.t<t>, array<TieBreak.t>) => list<scores>

@ocaml.doc("
 Groups the standings by score, see USCF tie-break rules from § 34.
 example: `[[Dale, Audrey], [Pete], [Bob]]` Dale and Audrey are tied for
 first, Pete is 2nd, Bob is 3rd.
 ")
let createStandingTree: list<scores> => list<list<scores>>
