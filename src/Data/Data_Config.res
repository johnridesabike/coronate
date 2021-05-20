/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
module Option = Belt.Option

module ByeValue = {
  type t = Full | Half

  let toFloat = x =>
    switch x {
    | Full => 1.0
    | Half => 0.5
    }

  let fromFloat = x =>
    switch x {
    | 1.0 => Full
    | 0.5 => Half
    | _ => Full
    }

  let encode = data => data->toFloat->Js.Json.number

  let decode = json => Js.Json.decodeNumber(json)->Option.getExn->fromFloat
}

type t = {
  avoidPairs: Data_Id.Pair.Set.t,
  byeValue: ByeValue.t,
  lastBackup: Js.Date.t,
}

let decode = json => {
  let d = Js.Json.decodeObject(json)->Option.getExn
  {
    avoidPairs: d->Js.Dict.get("avoidPairs")->Option.getExn->Data_Id.Pair.Set.decode,
    byeValue: d->Js.Dict.get("byeValue")->Option.getExn->ByeValue.decode,
    lastBackup: d
    ->Js.Dict.get("lastBackup")
    ->Option.flatMap(Js.Json.decodeString)
    ->Option.getExn
    ->Js.Date.fromString,
  }
}

let encode = data =>
  Js.Dict.fromArray([
    ("avoidPairs", data.avoidPairs->Data_Id.Pair.Set.encode),
    ("byeValue", data.byeValue->ByeValue.encode),
    ("lastBackup", data.lastBackup->Js.Date.toJSONUnsafe->Js.Json.string),
  ])->Js.Json.object_

let default = {
  byeValue: Full,
  avoidPairs: Belt.Set.make(~id=Data_Id.Pair.id),
  lastBackup: Js.Date.fromFloat(0.0),
}
