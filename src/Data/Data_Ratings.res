open Belt

module EloRank = {
  type t = int

  let getExpected = (a: int, b: int) => 1. /. (1. +. 10. ** (Float.fromInt(b - a) /. 400.))

  let updateRating = (rating, expected, actual, current) =>
    Float.fromInt(current) +. Float.fromInt(rating) *. (actual -. expected)
    |> Js.Math.round
    |> Int.fromFloat

  let getKFactor = (~matchCount) => {
    let ne = matchCount > 0 ? matchCount : 1
    800 / ne
  }
}

let floor = 100

let keepAboveFloor = rating => rating > floor ? rating : floor

let calcNewRatings = (~whiteRating, ~blackRating, ~whiteMatchCount, ~blackMatchCount, ~result) => {
  let whiteElo = EloRank.getKFactor(~matchCount=whiteMatchCount)
  let blackElo = EloRank.getKFactor(~matchCount=blackMatchCount)
  let whiteExpected = EloRank.getExpected(whiteRating, blackRating)
  let blackExpected = EloRank.getExpected(blackRating, whiteRating)
  let whiteResult = Data_Match.Result.toScoreWhite(result)->Data_Scoring.Score.toFloat
  let blackResult = Data_Match.Result.toScoreBlack(result)->Data_Scoring.Score.toFloat
  (
    EloRank.updateRating(whiteElo, whiteExpected, whiteResult, whiteRating)->keepAboveFloor,
    EloRank.updateRating(blackElo, blackExpected, blackResult, blackRating)->keepAboveFloor,
  )
}
