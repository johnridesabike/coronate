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
@send external request: (t, string, {..} as 'opts) => Promise.t<response<'a, 'b>> = "request"

module Gist = {
  type file = {
    id: string,
    name: string,
    updated_at: Date.t,
  }

  let list = (~token) => {
    make({"auth": token})
    ->request("GET /gists", Object.make())
    ->Promise.thenResolve(result =>
      result.data->Array.map(x => {
        name: Dict.keysToArray(x["files"])->Array.getUnsafe(0),
        id: x["id"],
        updated_at: Date.fromString(x["updated_at"]),
      })
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
              JSON.stringify(data)
            } else {
              JSON.stringify(data, ~space=2)
            },
          },
        },
      },
    )
  }

  let read = (~token, ~id) => {
    let octokit = make({"auth": token})
    request(octokit, "GET /gists/" ++ id, {"gist_id": id})->Promise.thenResolve(x => {
      let file = x.data["files"]->Dict.valuesToArray->Array.getUnsafe(0)
      file["content"]
    })
  }

  let create = (~token, ~data, ~minify) => {
    make({"auth": token})->request(
      "POST /gists",
      {
        "files": {
          "coronate-data.json": {
            "content": if minify {
              JSON.stringify(data)
            } else {
              JSON.stringify(data, ~space=2)
            },
          },
        },
      },
    )
  }
}
