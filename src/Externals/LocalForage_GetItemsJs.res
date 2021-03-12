type t = LocalForageJs.t
@module external localForage: t = "localforage"
@module("localforage-getitems")
external extendPrototype: t => unit = "extendPrototype"
let load = () => extendPrototype(localForage)

@bs.send
external dictFromArray: (t, array<string>) => Js.Promise.t<Js.Dict.t<Js.Json.t>> = "getItems"
@bs.send
external jsonFromArray: (t, array<string>) => Js.Promise.t<Js.Json.t> = "getItems"
@bs.send
external allDict: t => Js.Promise.t<Js.Dict.t<Js.Json.t>> = "getItems"
@bs.send external allJson: t => Js.Promise.t<Js.Json.t> = "getItems"
