type t

@module("localforage") external indexedDb: LocalForage_Config.driver = "INDEXEDDB"
@module("localforage") external webSql: LocalForage_Config.driver = "WEBSQL"
@module("localforage")
external localStorage: LocalForage_Config.driver = "LOCALSTORAGE"
@module("localforage") external make: LocalForage_Config.t => t = "createInstance"

@module("localforage")
external clear: unit => Js.Promise.t<unit> = "clear"

@ocaml.doc(" Data API ") @bs.send
external setItem: (t, string, Js.Json.t) => Js.Promise.t<unit> = "setItem"
@bs.send
external getItem: (t, string) => Js.Promise.t<Js.Nullable.t<Js.Json.t>> = "getItem"
@bs.send
external removeItem: (t, string) => Js.Promise.t<unit> = "removeItem"
@bs.send external length: t => Js.Promise.t<int> = "length"
@bs.send external key: t => Js.Promise.t<string> = "key"
@bs.send external keys: t => Js.Promise.t<array<string>> = "keys"
@bs.send
external iterate: (t, @uncurry (Js.Json.t, string, int) => unit) => Js.Promise.t<unit> = "iterate"

@ocaml.doc(" Settings API ") @bs.send
external setDriver: (t, LocalForage_Config.driver) => unit = "setDriver"
@bs.send
external setDriverMany: (t, array<LocalForage_Config.driver>) => unit = "setDriver"

/* `config` is mainly used for setting configs, but can also be used for
 getting info */
@bs.send external setConfig: (t, LocalForage_Config.t) => LocalForage_Config.t = "config"
@bs.send external getConfig: t => LocalForage_Config.t = "config"

/* Driver API: not implemented yet. */
