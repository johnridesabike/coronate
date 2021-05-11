/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
type t
type data = {token: string}
@module("netlify-auth-providers") @new external make: {..} => t = "default"
@send
external authenticate: (
  t,
  {"provider": [#github], "scope": string},
  @uncurry (Js.Nullable.t<exn>, option<data>) => unit,
) => unit = "authenticate"
