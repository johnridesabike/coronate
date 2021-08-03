/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
module ByeValue: {
  type t = Full | Half | Zero

  let toFloat: t => float

  let fromFloat: float => t
}

type t = {
  avoidPairs: Data_Id.Pair.Set.t,
  byeValue: ByeValue.t,
  lastBackup: Js.Date.t,
}

let decode: Js.Json.t => t
let encode: t => Js.Json.t

let default: t
