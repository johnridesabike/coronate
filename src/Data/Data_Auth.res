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

@raises(DecodeError)
let decode = json => {
  open Json.Decode
  {
    github_token: json |> field("github_token", string),
    github_gist_id: json |> field("github_gist_id", string),
  }
}

let encode = data => {
  open Json.Encode
  object_(list{
    ("github_token", data.github_token |> string),
    ("github_gist_id", data.github_gist_id |> string),
  })
}

let default = {
  github_token: "",
  github_gist_id: "",
}
