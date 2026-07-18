/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

module Type = {
  type t = Person | Dummy | Missing

  let toString = data =>
    switch data {
    | Person => "person"
    | Dummy => "dummy"
    | Missing => "missing"
    }

  let fromString = str =>
    switch str {
    | "person" => Person
    | "dummy" => Dummy
    | "missing" => Missing
    | _ => Person
    }

  let encode = data => data->toString->JSON.Encode.string

  let decode = data => JSON.Decode.string(data)->Option.getOrThrow->fromString
}

module NatInt = {
  type t = int

  let fromInt = x =>
    if x < 0 {
      0
    } else {
      x
    }

  let toInt = x => x
  let toString = x => Int.toString(x)

  let succ = x =>
    if x < 0 {
      0
    } else {
      x + 1
    }

  let pred = x =>
    if x < 1 {
      0
    } else {
      x - 1
    }
}

type t = {
  firstName: string,
  id: Data_Id.t,
  lastName: string,
  matchCount: NatInt.t,
  rating: int,
  type_: Type.t,
}

let fullName = t => t.firstName ++ " " ++ t.lastName

let compareName = (a, b) =>
  switch compare(a.firstName, b.firstName) {
  | 0 => compare(a.lastName, b.lastName)
  | i => i
  }

let succMatchCount = t => {...t, matchCount: NatInt.succ(t.matchCount)}
let predMatchCount = t => {...t, matchCount: NatInt.pred(t.matchCount)}

let setRating = (t, rating) => {...t, rating}

let decode = json => {
  let d = JSON.Decode.object(json)
  {
    id: d->Option.flatMap(d => Dict.get(d, "id"))->Option.getOrThrow->Data_Id.decode,
    firstName: d
    ->Option.flatMap(d => Dict.get(d, "firstName"))
    ->Option.flatMap(JSON.Decode.string)
    ->Option.getOrThrow,
    lastName: d
    ->Option.flatMap(d => Dict.get(d, "lastName"))
    ->Option.flatMap(JSON.Decode.string)
    ->Option.getOrThrow,
    matchCount: d
    ->Option.flatMap(d => Dict.get(d, "matchCount"))
    ->Option.flatMap(JSON.Decode.float)
    ->Option.getOrThrow
    ->Float.toInt,
    rating: d
    ->Option.flatMap(d => Dict.get(d, "rating"))
    ->Option.flatMap(JSON.Decode.float)
    ->Option.getOrThrow
    ->Float.toInt,
    type_: d->Option.flatMap(d => Dict.get(d, "type_"))->Option.getOrThrow->Type.decode,
  }
}

let encode = data =>
  Dict.fromArray([
    ("firstName", data.firstName->JSON.Encode.string),
    ("id", data.id->Data_Id.encode),
    ("lastName", data.lastName->JSON.Encode.string),
    ("matchCount", data.matchCount->Float.fromInt->JSON.Encode.float),
    ("rating", data.rating->Float.fromInt->JSON.Encode.float),
    ("type_", data.type_->Type.encode),
  ])->JSON.Encode.object

let dummy = {
  id: Data_Id.dummy,
  firstName: "[Bye]",
  lastName: "",
  type_: Dummy,
  matchCount: 0,
  rating: 0,
}

/**
 * If `getMaybe` can't find a profile (e.g. if it was deleted) then it
 * outputs this instead. The ID will be the same as missing player's ID.
 */
let makeMissing = id => {
  id,
  firstName: "Anonymous",
  lastName: "Player",
  type_: Missing,
  matchCount: 0,
  rating: 0,
}

let getMaybe = (playerMap, id) =>
  if Data_Id.isDummy(id) {
    dummy
  } else {
    Belt.Map.getWithDefault(playerMap, id, makeMissing(id))
  }
