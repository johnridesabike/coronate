type t = string;

let toString = x => x;

let fromString = x => x;

let dummy = "________DUMMY________";

let isDummy = id => id == dummy;

let random = Externals.nanoid;

let encode = Json.Encode.string;

let decode = Json.Decode.string;

let compare: (t, t) => int = compare;

module Id = (val Belt.Id.comparable(~cmp=compare));

let id: Belt.Id.comparable(t, Id.identity) = (module Id);

module Map = {
  type key = t;
  type identity = Id.identity;

  type t('v) = Belt.Map.t(key, 'v, identity);

  let make = () => Belt.Map.make(~id);

  let stringArray = x => x;

  let toStringArray = x => x;

  let fromStringArray = arr => arr->stringArray->Belt.Map.fromArray(~id);

  let toStringArray = map => map->Belt.Map.toArray->toStringArray;
};
