/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
type t<'value, 'identity>

let make: (
  LocalForage_Config.t,
  LocalForage_Id.encodable<'value, 'identity>,
) => t<'value, 'identity>

let getItem: (t<'value, 'identity>, ~key: string) => Promise.t<option<'value>>

let setItem: (t<'value, 'identity>, ~key: string, ~v: 'value) => Promise.t<unit>

let getKeys: t<'value, 'identity> => Promise.t<array<string>>

let getItems: (t<'value, 'identity>, ~keys: array<string>) => Promise.t<array<(string, 'value)>>

let getAllItems: t<'value, 'identity> => Promise.t<array<(string, 'value)>>

let setItems: (t<'value, 'identity>, ~items: array<(string, 'value)>) => Promise.t<unit>

let removeItems: (t<'value, 'identity>, ~items: array<string>) => Promise.t<unit>

let iterateU: (t<'value, 'identity>, ~f: ('value, string, int) => unit) => Promise.t<unit>

let iterate: (t<'value, 'identity>, ~f: ('value, string, int) => unit) => Promise.t<unit>
