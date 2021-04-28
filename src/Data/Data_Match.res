/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
module Id = Data_Id

/* Not to be confused with `Belt.Result` */
module Result = {
  type t = WhiteWon | BlackWon | Draw | NotSet

  let toString = x =>
    switch x {
    | WhiteWon => "whiteWon"
    | BlackWon => "blackWon"
    | Draw => "draw"
    | NotSet => "notSet"
    }

  let fromString = x =>
    switch x {
    | "whiteWon" => WhiteWon
    | "blackWon" => BlackWon
    | "draw" => Draw
    | _ => NotSet
    }

  let encode = data => data->toString->Json.Encode.string

  @raises(DecodeError)
  let decode = json => json->Json.Decode.string->fromString
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

@raises(DecodeError)
let decode = json => {
  open Json.Decode
  {
    id: json |> field("id", Id.decode),
    whiteId: json |> field("whiteId", Id.decode),
    blackId: json |> field("blackId", Id.decode),
    whiteNewRating: json |> field("whiteNewRating", int),
    blackNewRating: json |> field("blackNewRating", int),
    whiteOrigRating: json |> field("whiteOrigRating", int),
    blackOrigRating: json |> field("blackOrigRating", int),
    result: json |> field("result", Result.decode),
  }
}

let encode = data => {
  open Json.Encode
  object_(list{
    ("id", data.id |> Id.encode),
    ("whiteId", data.whiteId |> Id.encode),
    ("blackId", data.blackId |> Id.encode),
    ("whiteNewRating", data.whiteNewRating |> int),
    ("blackNewRating", data.blackNewRating |> int),
    ("whiteOrigRating", data.whiteOrigRating |> int),
    ("blackOrigRating", data.blackOrigRating |> int),
    ("result", data.result |> Result.encode),
  })
}

let byeResultForPlayerColor = (byeValue: Data_Config.ByeValue.t, result): Result.t =>
  switch byeValue {
  | Half => Draw
  | Full => result
  }

let scoreByeMatch = (match_, ~byeValue) =>
  switch (Id.isDummy(match_.whiteId), Id.isDummy(match_.blackId)) {
  | (true, false) => {
      ...match_,
      result: byeResultForPlayerColor(byeValue, BlackWon),
    }
  | (false, true) => {
      ...match_,
      result: byeResultForPlayerColor(byeValue, WhiteWon),
    }
  | (true, true) /* Two dummies?! */
  | (false, false) => match_
  }

let manualPair = ((white: Data_Player.t, black: Data_Player.t), byeValue) =>
  {
    id: Id.random(),
    result: NotSet,
    whiteId: white.id,
    blackId: black.id,
    whiteOrigRating: white.rating,
    blackOrigRating: black.rating,
    whiteNewRating: white.rating,
    blackNewRating: black.rating,
  }->scoreByeMatch(~byeValue)

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
