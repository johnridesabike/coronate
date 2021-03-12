module LF = LocalForageJs
module P = Js.Promise
module Id = LocalForage_Id
include LocalForage_LoadAllPlugins

type t<'a, 'identity> = {
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

let get = ({store, decode, _}) =>
  LocalForage_GetItemsJs.allJson(store) |> P.then_(items =>
    switch decode(. items) {
    | exception error => P.reject(error)
    | items => P.resolve(items)
    }
  )

let set = ({store, encode, _}, ~items) => LocalForage_SetItemsJs.fromJson(store, encode(. items))
