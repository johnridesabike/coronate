/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
module EloRank: {
  type t = int
  let getKFactor: int => int
}

@ocaml.doc("Make new ratings for white and black.")
let calcNewRatings: (
  ~whiteRating: EloRank.t,
  ~blackRating: EloRank.t,
  ~whiteMatchCount: int,
  ~blackMatchCount: int,
  ~result: Data_Match.Result.t,
) => (EloRank.t, EloRank.t)
