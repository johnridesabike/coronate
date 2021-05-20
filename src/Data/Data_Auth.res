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

module Option = Belt.Option

let decode = json => {
  let d = Js.Json.decodeObject(json)->Option.getExn
  {
    github_token: d
    ->Js.Dict.get("github_token")
    ->Option.flatMap(Js.Json.decodeString)
    ->Option.getExn,
    github_gist_id: d
    ->Js.Dict.get("github_gist_id")
    ->Option.flatMap(Js.Json.decodeString)
    ->Option.getExn,
  }
}

let encode = data =>
  Js.Dict.fromArray([
    ("github_token", data.github_token->Js.Json.string),
    ("github_gist_id", data.github_gist_id->Js.Json.string),
  ])->Js.Json.object_

let default = {
  github_token: "",
  github_gist_id: "",
}
