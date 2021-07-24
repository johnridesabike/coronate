/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
type t = LocalForage_Js.t

module GetItems = {
  @module("localforage-getitems")
  external extendPrototype: t => unit = "extendPrototype"
  @send
  external dictFromArray: (t, array<string>) => Promise.t<Js.Dict.t<Js.Json.t>> = "getItems"
  @send
  external jsonFromArray: (t, array<string>) => Promise.t<Js.Json.t> = "getItems"
  @send
  external allDict: t => Promise.t<Js.Dict.t<Js.Json.t>> = "getItems"
  @send external allJson: t => Promise.t<Js.Json.t> = "getItems"
}

module RemoveItems = {
  @module("localforage-removeitems")
  external extendPrototype: t => unit = "extendPrototype"
  @send
  external fromArray: (t, array<string>) => Promise.t<unit> = "removeItems"
}

module SetItems = {
  @module("localforage-setitems")
  external extendPrototype: t => unit = "extendPrototype"
  type item = {
    key: string,
    value: Js.Json.t,
  }
  @send
  external fromDict: (t, Js.Dict.t<Js.Json.t>) => Promise.t<unit> = "setItems"
  @send
  external fromJson: (t, Js.Json.t) => Promise.t<unit> = "setItems"
  @module("localforage")
  external fromArray: (t, array<item>) => Promise.t<unit> = "setItem"
}
