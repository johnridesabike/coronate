module EloRank: {
  type t = int
  let getKFactor: (~matchCount: int) => int
}

@ocaml.doc("
   * Make new ratings for white and black.
   ")
let calcNewRatings: (
  ~whiteRating: EloRank.t,
  ~blackRating: EloRank.t,
  ~whiteMatchCount: int,
  ~blackMatchCount: int,
  ~result: Data_Match.Result.t,
) => (EloRank.t, EloRank.t)
