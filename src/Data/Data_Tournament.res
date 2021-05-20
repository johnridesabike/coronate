/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open Belt

type t = {
  id: Data_Id.t,
  name: string,
  date: Js.Date.t,
  playerIds: Data_Id.Set.t,
  scoreAdjustments: Data_Id.Map.t<float>,
  byeQueue: array<Data_Id.t>,
  tieBreaks: array<Data_Scoring.TieBreak.t>,
  roundList: Data_Rounds.t,
}

let make = (~id, ~name) => {
  id: id,
  name: name,
  byeQueue: [],
  date: Js.Date.make(),
  playerIds: Set.make(~id=Data_Id.id),
  scoreAdjustments: Map.make(~id=Data_Id.id),
  roundList: Data_Rounds.empty,
  tieBreaks: [Median, Solkoff, Cumulative, CumulativeOfOpposition],
}

@ocaml.doc("
  LocalForage/IndexedDB sometimes automatically parses the date for us already,
  and I'm not sure how to propertly handle it.
")
external unsafe_date: Js.Json.t => Js.Date.t = "%identity"

@raises(Not_found)
let decode = json => {
  let d = Js.Json.decodeObject(json)->Option.getExn
  {
    id: d->Js.Dict.get("id")->Option.getExn->Data_Id.decode,
    name: d->Js.Dict.get("name")->Option.flatMap(Js.Json.decodeString)->Option.getExn,
    date: d
    ->Js.Dict.get("date")
    ->Option.map(json =>
      switch Js.Json.decodeString(json) {
      | Some(s) => Js.Date.fromString(s)
      | None => unsafe_date(json)
      }
    )
    ->Option.getExn,
    playerIds: d
    ->Js.Dict.get("playerIds")
    ->Option.flatMap(Js.Json.decodeArray)
    ->Option.getExn
    ->Array.map(Data_Id.decode)
    ->Set.fromArray(~id=Data_Id.id),
    byeQueue: d
    ->Js.Dict.get("byeQueue")
    ->Option.flatMap(Js.Json.decodeArray)
    ->Option.getExn
    ->Array.map(Data_Id.decode),
    tieBreaks: d
    ->Js.Dict.get("tieBreaks")
    ->Option.flatMap(Js.Json.decodeArray)
    ->Option.getExn
    ->Array.map(Data_Scoring.TieBreak.decode),
    roundList: d->Js.Dict.get("roundList")->Option.getExn->Data_Rounds.decode,
    scoreAdjustments: d
    ->Js.Dict.get("scoreAdjustments")
    ->Option.flatMap(Js.Json.decodeArray)
    ->Option.getWithDefault([])
    ->Array.keepMap(Js.Json.decodeArray)
    ->Array.keepMap(a =>
      switch (a[0], a[1]) {
      | (Some(k), Some(v)) =>
        switch Js.Json.decodeNumber(v) {
        | Some(v) => Some((Data_Id.decode(k), v))
        | None => None
        }
      | _ => None
      }
    )
    ->Map.fromArray(~id=Data_Id.id),
  }
}

let encode = data =>
  Js.Dict.fromArray([
    ("id", data.id->Data_Id.encode),
    ("name", data.name->Js.Json.string),
    ("date", data.date->Js.Date.toJSONUnsafe->Js.Json.string),
    ("playerIds", data.playerIds->Set.toArray->Array.map(Data_Id.encode)->Js.Json.array),
    ("byeQueue", data.byeQueue->Array.map(Data_Id.encode)->Js.Json.array),
    ("tieBreaks", data.tieBreaks->Array.map(Data_Scoring.TieBreak.encode)->Js.Json.array),
    ("roundList", data.roundList->Data_Rounds.encode),
    (
      "scoreAdjustments",
      data.scoreAdjustments
      ->Map.toArray
      ->Array.map(((k, v)) => [Data_Id.encode(k), Js.Json.number(v)]->Js.Json.array)
      ->Js.Json.array,
    ),
  ])->Js.Json.object_
