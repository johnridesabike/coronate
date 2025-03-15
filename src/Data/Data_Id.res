/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
module Array = Belt.Array
module Option = Belt.Option

type t = string

let toString = x => x

let fromString = x => x

let dummy = "________DUMMY________"

let isDummy = id => id == dummy

let random = Externals.nanoid

let encode = s => Js.Json.string(s)

let decode = json => Js.Json.decodeString(json)->Option.getExn

let compare: (t, t) => int = compare

let eq: (t, t) => bool = (a, b) => a == b

module Cmp = unpack(Belt.Id.comparable(~cmp=compare))

type identity = Cmp.identity

let id: Belt.Id.comparable<t, identity> = module(Cmp)

module Map = {
  type key = t
  type t<'v> = Belt.Map.t<key, 'v, identity>
  let fromStringArray = arr => arr->Belt.Map.fromArray(~id)
  let toStringArray = arr => Belt.Map.toArray(arr)
}

module Set = {
  type value = t
  type t = Belt.Set.t<value, identity>
}

module Pair = {
  type id = t
  type t = (t, t)

  /* This sorts the pairs. */
  let make = (a, b) =>
    switch compare(a, b) {
    | 0 => None
    | 1 => Some((a, b))
    | _ => Some((b, a))
    }

  /* This only works if the pairs are sorted. */
  let compare = ((a, b), (c, d)) =>
    switch compare(a, c) {
    | 0 =>
      switch compare(b, d) {
      | 0 => 0
      | x => x
      }
    | x => x
    }

  let has = ((a, b): t, ~id) => eq(a, id) || eq(b, id)

  let toTuple = t => t

  let decode = json => {
    let arr = Js.Json.decodeArray(json)
    let a = arr->Option.flatMap(arr => arr[0])->Option.getExn
    let b = arr->Option.flatMap(arr => arr[1])->Option.getExn
    (decode(a), decode(b))
  }

  let encode = ((a, b)) => Js.Json.array([encode(a), encode(b)])

  module Cmp = unpack(Belt.Id.comparable(~cmp=compare))

  type identity = Cmp.identity

  let id_id = id
  let id: Belt.Id.comparable<t, identity> = module(Cmp)

  module Id_Set = Set

  module Set = {
    type pair = t
    type t = Belt.Set.t<pair, identity>

    let decode = json =>
      json->Js.Json.decodeArray->Option.getExn->Array.map(decode)->Belt.Set.fromArray(~id)

    let encode = data => data->Belt.Set.toArray->Array.map(encode)->Js.Json.array

    let toMapReducer = (acc, (id1, id2)) => {
      let s1 = Belt.Set.make(~id=id_id)->Belt.Set.add(id2)
      let s2 = Belt.Set.make(~id=id_id)->Belt.Set.add(id1)
      acc
      ->Belt.Map.update(id1, s =>
        switch s {
        | None => Some(s1)
        | Some(s) => Some(Belt.Set.union(s, s1))
        }
      )
      ->Belt.Map.update(id2, s =>
        switch s {
        | None => Some(s2)
        | Some(s) => Some(Belt.Set.union(s, s2))
        }
      )
    }

    let toMap = x => Belt.Set.reduce(x, Belt.Map.make(~id=id_id), toMapReducer)
  }
}
