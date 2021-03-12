type t = LocalForageJs.t
@module external localForage: t = "localforage"

@module("localforage-setitems")
external extendPrototype: t => unit = "extendPrototype"
let load = () => extendPrototype(localForage)

type item = {
  key: string,
  value: Js.Json.t,
}

@bs.send
external fromDict: (t, Js.Dict.t<Js.Json.t>) => Js.Promise.t<unit> = "setItems"
@bs.send
external fromJson: (t, Js.Json.t) => Js.Promise.t<unit> = "setItems"
@module("localforage")
external fromArray: (t, array<item>) => Js.Promise.t<unit> = "setItem"
