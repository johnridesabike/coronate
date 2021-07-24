/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
module LF = LocalForage_Js
module P = Promise
module Id = LocalForage_Id

type t<'a, 'identity> = {
  store: LF.t,
  encode: (. 'a) => Js.Json.t,
  decode: (. Js.Json.t) => 'a,
}

let make = (config, type t id, data: Id.encodable<t, id>) => {
  module Data = unpack(data)
  let encode = Id.encode(Data.encode)
  let decode = Id.decode(Data.decode)
  {store: LF.make(config), encode: encode, decode: decode}
}

let get = ({store, decode, _}) =>
  LocalForage_Plugins.GetItems.allJson(store)->P.then(items =>
    switch decode(. items) {
    | exception error => P.reject(error)
    | items => P.resolve(items)
    }
  )

let set = ({store, encode, _}, ~items) =>
  LocalForage_Plugins.SetItems.fromJson(store, encode(. items))
