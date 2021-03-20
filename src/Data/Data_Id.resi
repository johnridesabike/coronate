type t

let toString: t => string

let fromString: string => t

@ocaml.doc("
 * This is used in by matches to indicate a dummy player. The `getPlayerMaybe`
 * function returns a special dummy player profile when fetching this ID.
 ")
let dummy: t

@ocaml.doc("
 * This is useful for passing to `keep` functions.
 ")
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
