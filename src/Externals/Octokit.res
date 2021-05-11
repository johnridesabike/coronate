/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
type t
type response<'a, 'b> = {
  status: int,
  url: string,
  headers: 'a,
  data: 'b,
}
@new @module("@octokit/core") external make: {"auth": string} => t = "Octokit"
@send external request: (t, string, {..} as 'opts) => Js.Promise.t<response<'a, 'b>> = "request"

module Gist = {
  type file = {
    id: string,
    name: string,
    updated_at: Js.Date.t,
  }

  let list = (~token) => {
    make({"auth": token})
    ->request("GET /gists", Js.Obj.empty())
    ->Promise.then(result =>
      result.data
      ->Belt.Array.map(x => {
        name: Js.Dict.keys(x["files"])->Belt.Array.getUnsafe(0),
        id: x["id"],
        updated_at: Js.Date.fromString(x["updated_at"]),
      })
      ->Promise.resolve
    )
  }

  let write = (~token, ~id, ~data, ~minify) => {
    make({"auth": token})->request(
      "PATCH /gists/" ++ id,
      {
        "gist_id": id,
        "files": {
          "coronate-data.json": {
            "content": if minify {
              Js.Json.stringify(data)
            } else {
              Js.Json.stringifyWithSpace(data, 2)
            },
          },
        },
      },
    )
  }

  let read = (~token, ~id) => {
    let octokit = make({"auth": token})
    request(octokit, "GET /gists/" ++ id, {"gist_id": id})->Promise.then(x => {
      let file = x.data["files"]->Js.Dict.values->Belt.Array.getUnsafe(0)
      file["content"]->Promise.resolve
    })
  }

  let create = (~token, ~data, ~minify) => {
    make({"auth": token})->request(
      "POST /gists",
      {
        "files": {
          "coronate-data.json": {
            "content": if minify {
              Js.Json.stringify(data)
            } else {
              Js.Json.stringifyWithSpace(data, 2)
            },
          },
        },
      },
    )
  }
}
