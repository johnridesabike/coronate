/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
module D = Js.Dict
module LF = LocalForage_Js
module P = Promise
module A = Js.Array2
module Id = LocalForage_Id

type t<'a, 'id> = {
  store: LF.t,
  encode: (. 'a) => Js.Json.t,
  decode: (. Js.Json.t) => 'a,
}

let make = (config, type t id, data: Id.encodable<t, id>) => {
  module Data = unpack(data)
  let encode = Id.encode(Data.encode)
  let decode = Id.decode(Data.decode)
  {store: LF.make(config), encode, decode}
}

let getItem = ({store, decode, _}, ~key) =>
  LF.getItem(store, key)->P.then(value =>
    switch value->Js.Nullable.toOption->Belt.Option.mapU(decode) {
    | exception error => P.reject(error)
    | value => P.resolve(value)
    }
  )

let setItem = ({store, encode, _}, ~key, ~v) => LF.setItem(store, key, encode(. v))

let getKeys = ({store, _}) => LF.keys(store)

let mapValues = ((key, value), ~f) => (key, f(. value))

let parseItems = (decode, items) => items->D.entries->A.map(mapValues(~f=decode))

let getItems = ({store, decode, _}, ~keys) =>
  LocalForage_Plugins.GetItems.dictFromArray(store, keys)->P.then(items =>
    switch parseItems(decode, items) {
    | exception error => P.reject(error)
    | items => P.resolve(items)
    }
  )

let getAllItems = ({store, decode, _}) =>
  LocalForage_Plugins.GetItems.allDict(store)->P.then(items =>
    switch parseItems(decode, items) {
    | exception error => P.reject(error)
    | items => P.resolve(items)
    }
  )

let setItems = ({store, encode, _}, ~items) =>
  items->A.map(mapValues(~f=encode))->D.fromArray->LocalForage_Plugins.SetItems.fromDict(store, _)

let removeItems = ({store, _}, ~items) => LocalForage_Plugins.RemoveItems.fromArray(store, items)

let iterateU = ({store, decode, _}, ~f) =>
  LF.iterate(store, (value, key, iterationNumber) => f(. decode(. value), key, iterationNumber))

let iterate = (map, ~f) => iterateU(map, ~f=(. value, key, num) => f(value, key, num))
