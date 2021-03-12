module D = Js.Dict
module LF = LocalForageJs
module P = Js.Promise
module A = Js.Array
module Id = LocalForage_Id
include LocalForage_LoadAllPlugins

type t<'a, 'id> = {
  store: LocalForageJs.t,
  encode: (. 'a) => Js.Json.t,
  decode: (. Js.Json.t) => 'a,
}

let make = (config, type t id, data: Id.encodable<t, id>) => {
  module Data = unpack(data)
  let encode = Id.encode(Data.encode)
  let decode = Id.decode(Data.decode)
  {store: LF.make(config), encode: encode, decode: decode}
}

let getItem = ({store, decode, _}, ~key) =>
  LF.getItem(store, key) |> P.then_(value =>
    switch value->Js.Nullable.toOption->Belt.Option.mapU(decode) {
    | exception error => P.reject(error)
    | value => P.resolve(value)
    }
  )

let setItem = ({store, encode, _}, ~key, ~v) => LF.setItem(store, key, encode(. v))

let getKeys = ({store, _}) => LF.keys(store)

let mapValues = ((key, value), ~f) => (key, f(. value))

let parseItems = (decode, items) => items |> D.entries |> A.map(mapValues(~f=decode))

let getItems = ({store, decode, _}, ~keys) =>
  LocalForage_GetItemsJs.dictFromArray(store, keys) |> P.then_(items =>
    switch parseItems(decode, items) {
    | exception error => P.reject(error)
    | items => P.resolve(items)
    }
  )

let getAllItems = ({store, decode, _}) =>
  LocalForage_GetItemsJs.allDict(store) |> P.then_(items =>
    switch parseItems(decode, items) {
    | exception error => P.reject(error)
    | items => P.resolve(items)
    }
  )

let setItems = ({store, encode, _}, ~items) =>
  items |> A.map(mapValues(~f=encode)) |> D.fromArray |> LocalForage_SetItemsJs.fromDict(store)

let removeItems = ({store, _}, ~items) => LocalForage_RemoveItemsJs.fromArray(store, items)

let iterateU = ({store, decode, _}, ~f) =>
  LF.iterate(store, (value, key, iterationNumber) => f(. decode(. value), key, iterationNumber))

let iterate = (map, ~f) => iterateU(map, ~f=(. value, key, num) => f(value, key, num))
