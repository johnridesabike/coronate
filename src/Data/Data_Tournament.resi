/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
type t = {
  id: Data_Id.t,
  name: string,
  date: Js.Date.t,
  playerIds: Data_Id.Set.t,
  scoreAdjustments: Data_Id.Map.t<float>,
  byeQueue: array<Data_Id.t>,
  byeRequests: Data_Id.Map.t<Belt.Set.Int.t>,
  totalRounds: int,
  tieBreaks: array<Data_Scoring.TieBreak.t>,
  roundList: Data_Rounds.t,
}

let make: (~id: Data_Id.t, ~name: string) => t

let encode: t => Js.Json.t

let decode: Js.Json.t => t
