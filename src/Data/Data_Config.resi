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

type alias

type t = {
  avoidPairs: Data_Id.Pair.Set.t,
  byeValue: ByeValue.t,
  lastBackup: Js.Date.t,
  whiteAlias: alias,
  blackAlias: alias,
}

let decode: Js.Json.t => t
let encode: t => Js.Json.t

let default: t

/** An empty alias uses "White" or "Black" for player names. */
let aliasEmpty: alias

/** An empty string produces an empty alias. */
let alias: string => alias

let aliasToStringWhite: t => string
let aliasToStringBlack: t => string
let aliasToOption: alias => option<string>
