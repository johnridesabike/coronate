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
