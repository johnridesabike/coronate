/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
module Id = Data_Id
module Float = Belt.Float
module Option = Belt.Option

/* Not to be confused with `Belt.Result` */
module Result = {
  type t = WhiteWon | BlackWon | Draw | Aborted | WhiteAborted | BlackAborted | NotSet

  let toString = x =>
    switch x {
    | WhiteWon => "whiteWon"
    | BlackWon => "blackWon"
    | Draw => "draw"
    | Aborted => "aborted"
    | WhiteAborted => "whiteAborted"
    | BlackAborted => "blackAborted"
    | NotSet => "notSet"
    }

  let fromString = x =>
    switch x {
    | "whiteWon" => WhiteWon
    | "blackWon" => BlackWon
    | "draw" => Draw
    | "aborted" => Aborted
    | "whiteAborted" => WhiteAborted
    | "blackAborted" => BlackAborted
    | _ => NotSet
    }

  let encode = data => data->toString->Js.Json.string

  let decode = json => Js.Json.decodeString(json)->Option.getExn->fromString

  let scoreByeMatch = (~white, ~black, ~byeValue: Data_Config.ByeValue.t, ~default) => {
    switch (Id.isDummy(white), Id.isDummy(black), byeValue) {
    | (true, _, Full) | (_, true, Zero) => BlackWon
    | (_, true, Full) | (true, _, Zero) => WhiteWon
    | (true, _, Half) | (_, true, Half) => Draw
    | (false, false, Full | Half | Zero) => default
    }
  }

  let reverse = t =>
    switch t {
    | WhiteWon => BlackWon
    | BlackWon => WhiteWon
    | WhiteAborted => BlackAborted
    | BlackAborted => WhiteAborted
    | (NotSet | Draw | Aborted) as t => t
    }
}

type t = {
  id: Id.t,
  whiteId: Id.t,
  blackId: Id.t,
  whiteNewRating: int,
  blackNewRating: int,
  whiteOrigRating: int,
  blackOrigRating: int,
  result: Result.t,
}

let decode = json => {
  let d = Js.Json.decodeObject(json)
  {
    id: d->Option.flatMap(d => Js.Dict.get(d, "id"))->Option.getExn->Id.decode,
    whiteId: d->Option.flatMap(d => Js.Dict.get(d, "whiteId"))->Option.getExn->Id.decode,
    blackId: d->Option.flatMap(d => Js.Dict.get(d, "blackId"))->Option.getExn->Id.decode,
    whiteNewRating: d
    ->Option.flatMap(d => Js.Dict.get(d, "whiteNewRating"))
    ->Option.flatMap(Js.Json.decodeNumber)
    ->Option.getExn
    ->Float.toInt,
    blackNewRating: d
    ->Option.flatMap(d => Js.Dict.get(d, "blackNewRating"))
    ->Option.flatMap(Js.Json.decodeNumber)
    ->Option.getExn
    ->Float.toInt,
    whiteOrigRating: d
    ->Option.flatMap(d => Js.Dict.get(d, "whiteOrigRating"))
    ->Option.flatMap(Js.Json.decodeNumber)
    ->Option.getExn
    ->Float.toInt,
    blackOrigRating: d
    ->Option.flatMap(d => Js.Dict.get(d, "blackOrigRating"))
    ->Option.flatMap(Js.Json.decodeNumber)
    ->Option.getExn
    ->Float.toInt,
    result: d->Option.flatMap(d => Js.Dict.get(d, "result"))->Option.getExn->Result.decode,
  }
}

let encode = data =>
  Js.Dict.fromArray([
    ("id", data.id->Id.encode),
    ("whiteId", data.whiteId->Id.encode),
    ("blackId", data.blackId->Id.encode),
    ("whiteNewRating", data.whiteNewRating->Float.fromInt->Js.Json.number),
    ("blackNewRating", data.blackNewRating->Float.fromInt->Js.Json.number),
    ("whiteOrigRating", data.whiteOrigRating->Float.fromInt->Js.Json.number),
    ("blackOrigRating", data.blackOrigRating->Float.fromInt->Js.Json.number),
    ("result", data.result->Result.encode),
  ])->Js.Json.object_

let manualPair = (~white: Data_Player.t, ~black: Data_Player.t, result, byeValue) => {
  id: Id.random(),
  result: switch result {
  | Result.NotSet =>
    Result.scoreByeMatch(~byeValue, ~white=white.id, ~black=black.id, ~default=NotSet)
  | WhiteWon | BlackWon | Draw => result
  },
  whiteId: white.id,
  blackId: black.id,
  whiteOrigRating: white.rating,
  blackOrigRating: black.rating,
  whiteNewRating: white.rating,
  blackNewRating: black.rating,
}

let swapColors = match => {
  ...match,
  result: switch match.result {
  | WhiteWon => BlackWon
  | BlackWon => WhiteWon
  | (Draw | NotSet) as x => x
  },
  whiteId: match.blackId,
  blackId: match.whiteId,
  whiteOrigRating: match.blackOrigRating,
  blackOrigRating: match.whiteOrigRating,
  whiteNewRating: match.blackNewRating,
  blackNewRating: match.whiteNewRating,
}
