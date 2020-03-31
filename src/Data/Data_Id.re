type t = string;

external toString: t => string = "%identity";

external fromString: string => t = "%identity";

let dummy = "________DUMMY________";

let isDummy = id => id == dummy;

let random = Externals.nanoid;

let encode = Json.Encode.string;

let decode = Json.Decode.string;

let compare: (t, t) => int = compare;

module Id =
  Belt.Id.MakeComparable({
    type nonrec t = t;
    let cmp = compare;
  });

let id: Belt.Id.comparable(t, Id.identity) = (module Id);

module Map = {
  type key = t;
  type identity = Id.identity;

  type t('v) = Belt.Map.t(key, 'v, identity);

  let make = () => Belt.Map.make(~id);

  external stringArray: array((string, 'v)) => array((key, 'v)) =
    "%identity";

  external toStringArray: array((key, 'v)) => array((string, 'v)) =
    "%identity";

  let fromStringArray = arr => arr->stringArray->Belt.Map.fromArray(~id);

  let toStringArray = map => map->Belt.Map.toArray->toStringArray;
};
