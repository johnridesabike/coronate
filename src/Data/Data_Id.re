type t = string;

let toString = x => x;

let fromString = x => x;

let dummy = "________DUMMY________";

let isDummy = id => id == dummy;

let random = Externals.nanoid;

let encode = Json.Encode.string;

let decode = Json.Decode.string;

let compare: (t, t) => int = compare;

let eq: (t, t) => bool = (==);

module Id = (val Belt.Id.comparable(~cmp=compare));

let id: Belt.Id.comparable(t, Id.identity) = (module Id);

module Map = {
  type key = t;
  type identity = Id.identity;

  type t('v) = Belt.Map.t(key, 'v, identity);

  let make = () => Belt.Map.make(~id);

  let fromArray = a => Belt.Map.fromArray(a, ~id);

  let fromStringArray = arr => arr->Belt.Map.fromArray(~id);

  let toStringArray = map => map->Belt.Map.toArray;
};
