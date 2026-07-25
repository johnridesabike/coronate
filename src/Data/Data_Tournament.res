/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
type t = {
  id: Data_Id.t,
  name: string,
  date: Date.t,
  playerIds: Data_Id.Set.t,
  scoreAdjustments: Data_Id.Map.t<float>,
  byeQueue: array<Data_Id.t>,
  tieBreaks: array<Data_Scoring.TieBreak.t>,
  roundList: Data_Rounds.t,
}

let make = (~id, ~name) => {
  id,
  name,
  byeQueue: [],
  date: Date.make(),
  playerIds: Belt.Set.make(~id=Data_Id.id),
  scoreAdjustments: Belt.Map.make(~id=Data_Id.id),
  roundList: Data_Rounds.empty,
  tieBreaks: [Median, Solkoff, Cumulative, CumulativeOfOpposition],
}

/**
  LocalForage/IndexedDB sometimes automatically parses the date for us already,
  and I'm not sure how to propertly handle it.
  */
external unsafe_date: JSON.t => Date.t = "%identity"

@raises(Not_found)
let decode = json => {
  let d = JSON.Decode.object(json)->Option.getOrThrow
  {
    id: d->Dict.get("id")->Option.getOrThrow->Data_Id.decode,
    name: d->Dict.get("name")->Option.flatMap(JSON.Decode.string)->Option.getOrThrow,
    date: d
    ->Dict.get("date")
    ->Option.map(json =>
      switch JSON.Decode.string(json) {
      | Some(s) => Date.fromString(s)
      | None => unsafe_date(json)
      }
    )
    ->Option.getOrThrow,
    playerIds: d
    ->Dict.get("playerIds")
    ->Option.flatMap(JSON.Decode.array)
    ->Option.getOrThrow
    ->Array.map(Data_Id.decode)
    ->Belt.Set.fromArray(~id=Data_Id.id),
    byeQueue: d
    ->Dict.get("byeQueue")
    ->Option.flatMap(JSON.Decode.array)
    ->Option.getOrThrow
    ->Array.map(Data_Id.decode),
    tieBreaks: d
    ->Dict.get("tieBreaks")
    ->Option.flatMap(JSON.Decode.array)
    ->Option.getOrThrow
    ->Array.map(Data_Scoring.TieBreak.decode),
    roundList: d->Dict.get("roundList")->Option.getOrThrow->Data_Rounds.decode,
    scoreAdjustments: d
    ->Dict.get("scoreAdjustments")
    ->Option.flatMap(JSON.Decode.array)
    ->Option.getOr([])
    ->Array.filterMap(JSON.Decode.array)
    ->Array.filterMap(a =>
      switch (a[0], a[1]) {
      | (Some(k), Some(v)) =>
        switch JSON.Decode.float(v) {
        | Some(v) => Some((Data_Id.decode(k), v))
        | None => None
        }
      | _ => None
      }
    )
    ->Belt.Map.fromArray(~id=Data_Id.id),
  }
}

let encode = data =>
  Dict.fromArray([
    ("id", data.id->Data_Id.encode),
    ("name", data.name->JSON.Encode.string),
    ("date", data.date->Date.toJSON->Option.getOr("")->JSON.Encode.string),
    ("playerIds", data.playerIds->Belt.Set.toArray->Array.map(Data_Id.encode)->JSON.Encode.array),
    ("byeQueue", data.byeQueue->Array.map(Data_Id.encode)->JSON.Encode.array),
    ("tieBreaks", data.tieBreaks->Array.map(Data_Scoring.TieBreak.encode)->JSON.Encode.array),
    ("roundList", data.roundList->Data_Rounds.encode),
    (
      "scoreAdjustments",
      data.scoreAdjustments
      ->Belt.Map.toArray
      ->Array.map(((k, v)) => [Data_Id.encode(k), JSON.Encode.float(v)]->JSON.Encode.array)
      ->JSON.Encode.array,
    ),
  ])->JSON.Encode.object
