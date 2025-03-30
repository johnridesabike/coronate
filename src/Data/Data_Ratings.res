/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open! Belt

module EloRank = {
  type t = int

  let getExpected = (a, b) => 1. /. (1. +. 10. ** (Float.fromInt(b - a) /. 400.))

  let updateRating = (rating, expected, actual, current) =>
    (Float.fromInt(current) +. Float.fromInt(rating) *. (actual -. expected))
    ->Js.Math.round
    ->Int.fromFloat

  let getKFactor = (~matchCount, ~rating) =>
    if Data_Player.NatInt.toInt(matchCount) < 30 {
      40
    } else if rating > 2100 {
      10
    } else {
      20
    }
}

let floor = 100

let keepAboveFloor = rating => rating > floor ? rating : floor

let calcNewRatings = (~whiteRating, ~blackRating, ~whiteMatchCount, ~blackMatchCount, ~result) => {
  let whiteElo = EloRank.getKFactor(~matchCount=whiteMatchCount, ~rating=whiteRating)
  let blackElo = EloRank.getKFactor(~matchCount=blackMatchCount, ~rating=blackRating)
  let whiteExpected = EloRank.getExpected(whiteRating, blackRating)
  let blackExpected = EloRank.getExpected(blackRating, whiteRating)
  let whiteResult = Data_Scoring.Score.fromResultWhite(result)->Data_Scoring.Score.toFloat
  let blackResult = Data_Scoring.Score.fromResultBlack(result)->Data_Scoring.Score.toFloat
  (
    EloRank.updateRating(whiteElo, whiteExpected, whiteResult, whiteRating)->keepAboveFloor,
    EloRank.updateRating(blackElo, blackExpected, blackResult, blackRating)->keepAboveFloor,
  )
}
