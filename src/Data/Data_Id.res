type t = string

let toString = x => x

let fromString = x => x

let dummy = "________DUMMY________"

let isDummy = id => id == dummy

let random = Externals.nanoid

let encode = Json.Encode.string

let decode = Json.Decode.string

let compare: (t, t) => int = compare

let eq: (t, t) => bool = (a, b) => a == b

module Cmp = unpack(Belt.Id.comparable(~cmp=compare))

type identity = Cmp.identity

let id: Belt.Id.comparable<t, identity> = module(Cmp)

module Map = {
  type key = t
  type t<'v> = Belt.Map.t<key, 'v, identity>
  let fromStringArray = arr => arr->Belt.Map.fromArray(~id)
  let toStringArray = Belt.Map.toArray
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

  let decode = json => Json.Decode.pair(decode, decode, json)

  let encode = data => Json.Encode.pair(encode, encode, data)

  module Cmp = unpack(Belt.Id.comparable(~cmp=compare))

  type identity = Cmp.identity

  module Id_Set = Set

  module Set = {
    type pair = t
    type t = Belt.Set.t<pair, identity>

    let empty = Belt.Set.make(~id=module(Cmp))

    let fromArray = Belt.Set.fromArray(~id=module(Cmp))

    let decode = json => json |> Json.Decode.array(decode) |> fromArray

    let encode = data => Belt.Set.toArray(data) |> Json.Encode.array(encode)

    let toMapReducer = (acc, (id1, id2)) => {
      let newSet1 = switch Belt.Map.get(acc, id1) {
      | None => Belt.Set.make(~id)->Belt.Set.add(id2)
      | Some(s) => Belt.Set.add(s, id2)
      }
      let newSet2 = switch Belt.Map.get(acc, id2) {
      | None => Belt.Set.make(~id)->Belt.Set.add(id1)
      | Some(s) => Belt.Set.add(s, id1)
      }
      acc->Belt.Map.set(id1, newSet1)->Belt.Map.set(id2, newSet2)
    }

    let toMap = x => Belt.Set.reduce(x, Belt.Map.make(~id), toMapReducer)
  }
}
