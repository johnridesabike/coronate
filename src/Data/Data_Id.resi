type t

let toString: t => string

let fromString: string => t

@ocaml.doc("
  This is used in by matches to indicate a dummy player. The `getPlayerMaybe`
  function returns a special dummy player profile when fetching this ID.
 ")
let dummy: t

@ocaml.doc("This is useful for passing to `keep` functions.")
let isDummy: t => bool

let random: unit => t

let encode: t => Js.Json.t

let decode: Js.Json.t => t

let compare: (t, t) => int

let eq: (t, t) => bool

type identity

let id: Belt.Id.comparable<t, identity>

module Map: {
  type key = t
  type t<'v> = Belt.Map.t<key, 'v, identity>

  let fromStringArray: array<(string, 'v)> => t<'v>

  let toStringArray: t<'v> => array<(string, 'v)>
}

module Set: {
  type value = t
  type t = Belt.Set.t<value, identity>
}

module Pair: {
  type id = t
  type t
  type identity
  let make: (id, id) => option<t>
  let has: (t, ~id: id) => bool
  let toTuple: t => (id, id)
  module Id_Set = Set

  module Set: {
    type pair = t
    type t = Belt.Set.t<pair, identity>
    let empty: t
    let fromArray: array<pair> => t
    let encode: t => Js.Json.t
    let decode: Js.Json.t => t

    @ocaml.doc("
     Flatten the `set((id1, id2), (id1, id3))` structure into an easy-to-access
     `{id1: set(id2, id3), id2: set(id1), id3: set(id1)}` structure.
     ")
    let toMap: t => Map.t<Id_Set.t>
  }
}
