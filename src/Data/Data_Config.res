/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

module ByeValue = {
  type t = Full | Half | Zero

  let toFloat = x =>
    switch x {
    | Full => 1.0
    | Half => 0.5
    | Zero => 0.0
    }

  let fromFloat = x =>
    switch x {
    | 0.5 => Half
    | 0.0 => Zero
    | _ => Full
    }

  let encode = data => data->toFloat->JSON.Encode.float

  let decode = json => JSON.Decode.float(json)->Option.getOrThrow->fromFloat
}

type alias = option<string>

type t = {
  avoidPairs: Data_Id.Pair.Set.t,
  byeValue: ByeValue.t,
  lastBackup: Date.t,
  whiteAlias: alias,
  blackAlias: alias,
}

let decode = json => {
  let d = JSON.Decode.object(json)->Option.getOrThrow
  {
    avoidPairs: d->Dict.get("avoidPairs")->Option.getOrThrow->Data_Id.Pair.Set.decode,
    byeValue: d->Dict.get("byeValue")->Option.getOrThrow->ByeValue.decode,
    lastBackup: d
    ->Dict.get("lastBackup")
    ->Option.flatMap(JSON.Decode.string)
    ->Option.getOrThrow
    ->Date.fromString,
    whiteAlias: d->Dict.get("whiteAlias")->Option.flatMap(JSON.Decode.string),
    blackAlias: d->Dict.get("blackAlias")->Option.flatMap(JSON.Decode.string),
  }
}

let encodeAlias = o =>
  switch o {
  | None => JSON.Encode.null

  | Some(s) => JSON.Encode.string(s)
  }

let encode = data =>
  Dict.fromArray([
    ("avoidPairs", data.avoidPairs->Data_Id.Pair.Set.encode),
    ("byeValue", data.byeValue->ByeValue.encode),
    ("lastBackup", data.lastBackup->Date.toJSON->Option.getOr("")->JSON.Encode.string),
    ("whiteAlias", encodeAlias(data.whiteAlias)),
    ("blackAlias", encodeAlias(data.blackAlias)),
  ])->JSON.Encode.object

let default = {
  byeValue: Full,
  avoidPairs: Belt.Set.make(~id=Data_Id.Pair.id),
  lastBackup: Date.fromTime(0.0),
  whiteAlias: None,
  blackAlias: None,
}

let aliasEmpty = None
let alias = s =>
  switch s {
  | "" => None
  | s => Some(s)
  }

let aliasToStringWhite = t =>
  switch t.whiteAlias {
  | None => "White"
  | Some(s) => s
  }

let aliasToStringBlack = t =>
  switch t.blackAlias {
  | None => "Black"
  | Some(s) => s
  }

let aliasToOption = o => o
