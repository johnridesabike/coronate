/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
type t = {
  github_token: string,
  github_gist_id: string,
}

let decode = json => {
  let d = JSON.Decode.object(json)->Option.getOrThrow
  {
    github_token: d
    ->Dict.get("github_token")
    ->Option.flatMap(JSON.Decode.string)
    ->Option.getOrThrow,
    github_gist_id: d
    ->Dict.get("github_gist_id")
    ->Option.flatMap(JSON.Decode.string)
    ->Option.getOrThrow,
  }
}

let encode = data =>
  Dict.fromArray([
    ("github_token", data.github_token->JSON.Encode.string),
    ("github_gist_id", data.github_gist_id->JSON.Encode.string),
  ])->JSON.Encode.object

let default = {
  github_token: "",
  github_gist_id: "",
}
