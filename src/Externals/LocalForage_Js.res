/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
type t

@module("localforage") external indexedDb: LocalForage_Config.driver = "INDEXEDDB"
@module("localforage") external webSql: LocalForage_Config.driver = "WEBSQL"
@module("localforage")
external localStorage: LocalForage_Config.driver = "LOCALSTORAGE"
@module("localforage") external make: LocalForage_Config.t => t = "createInstance"

@module("localforage")
external clear: unit => Promise.t<unit> = "clear"

/* Data API */
@send
external setItem: (t, string, Js.Json.t) => Promise.t<unit> = "setItem"
@send
external getItem: (t, string) => Promise.t<Js.Nullable.t<Js.Json.t>> = "getItem"
@send
external removeItem: (t, string) => Promise.t<unit> = "removeItem"
@send external length: t => Promise.t<int> = "length"
@send external key: t => Promise.t<string> = "key"
@send external keys: t => Promise.t<array<string>> = "keys"
@send
external iterate: (t, @uncurry (Js.Json.t, string, int) => unit) => Promise.t<unit> = "iterate"

/* Settings API */
@send
external setDriver: (t, LocalForage_Config.driver) => unit = "setDriver"
@send
external setDriverMany: (t, array<LocalForage_Config.driver>) => unit = "setDriver"

/* `config` is mainly used for setting configs, but can also be used for
 getting info */
@send external setConfig: (t, LocalForage_Config.t) => LocalForage_Config.t = "config"
@send external getConfig: t => LocalForage_Config.t = "config"

/* Driver API: not implemented yet. */
