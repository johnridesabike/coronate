type t = LocalForage_Js.t

module GetItems = {
  @module("localforage-getitems")
  external extendPrototype: t => unit = "extendPrototype"
  @bs.send
  external dictFromArray: (t, array<string>) => Js.Promise.t<Js.Dict.t<Js.Json.t>> = "getItems"
  @bs.send
  external jsonFromArray: (t, array<string>) => Js.Promise.t<Js.Json.t> = "getItems"
  @bs.send
  external allDict: t => Js.Promise.t<Js.Dict.t<Js.Json.t>> = "getItems"
  @bs.send external allJson: t => Js.Promise.t<Js.Json.t> = "getItems"
}

module RemoveItems = {
  @module("localforage-removeitems")
  external extendPrototype: t => unit = "extendPrototype"
  @bs.send
  external fromArray: (t, array<string>) => Js.Promise.t<unit> = "removeItems"
}

module SetItems = {
  @module("localforage-setitems")
  external extendPrototype: t => unit = "extendPrototype"
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
}
