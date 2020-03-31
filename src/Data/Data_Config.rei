module ByeValue: {
  type t =
    | Full
    | Half;

  let toFloat: t => float;

  let fromFloat: float => t;
};

module AvoidPairs: {
  type pair = (Data_Id.t, Data_Id.t);

  module T: {
    type t = pair;
    type identity;
  };

  type t = Belt.Set.t(pair, T.identity);

  let empty: t;

  let fromArray: array(pair) => t;

  let fromStringArray: array((string, string)) => t;

  let toMap: t => Data_Id.Map.t(list(Data_Id.t));
};

type t = {
  avoidPairs: AvoidPairs.t,
  byeValue: ByeValue.t,
  lastBackup: Js.Date.t,
};

let decode: Js.Json.t => t;
let encode: t => Js.Json.t;

let default: t;
