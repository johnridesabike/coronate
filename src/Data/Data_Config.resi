module ByeValue: {
  type t = Full | Half

  let toFloat: t => float

  let fromFloat: float => t
}

module Pair: {
  type t
  type pair = t

  type identity

  let make: (Data_Id.t, Data_Id.t) => option<t>

  let has: (t, ~id: Data_Id.t) => bool

  module Set: {
    type t = Belt.Set.t<pair, identity>

    let empty: t

    let fromArray: array<pair> => t

    @ocaml.doc("
     Flatten the `set((id1, id2), (id1, id3))` structure into an easy-to-access
     `{id1: set(id2, id3), id2: set(id1), id3: set(id1)}` structure.
     ")
    let toMap: t => Data_Id.Map.t<Data_Id.Set.t>
  }
}

type t = {
  avoidPairs: Pair.Set.t,
  byeValue: ByeValue.t,
  lastBackup: Js.Date.t,
}

let decode: Js.Json.t => t
let encode: t => Js.Json.t

let default: t
