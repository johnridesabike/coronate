/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
module Result: {
  type t = WhiteWon | BlackWon | Draw | Aborted | WhiteAborted | BlackAborted | NotSet

  let toString: t => string

  let fromString: string => t

  let scoreByeMatch: (
    ~white: Data_Id.t,
    ~black: Data_Id.t,
    ~byeValue: Data_Config.ByeValue.t,
    ~default: t,
  ) => t

  let reverse: t => t
}

type t = {
  id: Data_Id.t,
  whiteId: Data_Id.t,
  blackId: Data_Id.t,
  whiteNewRating: int,
  blackNewRating: int,
  whiteOrigRating: int,
  blackOrigRating: int,
  result: Result.t,
}

let decode: Js.Json.t => t

let encode: t => Js.Json.t

let manualPair: (
  ~white: Data_Player.t,
  ~black: Data_Player.t,
  Result.t,
  Data_Config.ByeValue.t,
) => t

@ocaml.doc("\"Reverse\" white and black.")
let swapColors: t => t
