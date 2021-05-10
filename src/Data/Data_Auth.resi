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

let encode: t => Js.Json.t

let decode: Js.Json.t => t

let default: t
