open Belt;

module ByeValue = {
  type t =
    | Full
    | Half;

  let toFloat =
    fun
    | Full => 1.0
    | Half => 0.5;

  let fromFloat =
    fun
    | 1.0 => Full
    | 0.5 => Half
    | _ => Full;

  let encode = data => data->toFloat->Json.Encode.float;

  let decode = json => json->Json.Decode.float->fromFloat;
};

module Pair = {
  type t = (Data_Id.t, Data_Id.t);
  type pair = t;

  /* This sorts the pairs. */
  let make = (a, b) =>
    switch (Data_Id.compare(a, b)) {
    | 0 => None
    | 1 => Some((a, b))
    | _ => Some((b, a))
    };

  let has = ((a, b), ~id) => a === id || b === id;

  module Cmp =
    Belt.Id.MakeComparable({
      type t = pair;

      /* This only works if the pairs are sorted. */
      let cmp = ((a, b), (c, d)) =>
        switch (Data_Id.compare(a, c)) {
        | 0 =>
          switch (Data_Id.compare(b, d)) {
          | 0 => 0
          | x => x
          }
        | x => x
        };
    });

  type identity = Cmp.identity;

  module Set = {
    type t = Set.t(pair, identity);

    let empty = Set.make(~id=(module Cmp));

    let fromArray = Set.fromArray(~id=(module Cmp));

    let decode = json =>
      Json.Decode.(json |> array(pair(Data_Id.decode, Data_Id.decode)))
      ->fromArray;

    let encode = data =>
      Set.toArray(data)
      |> Json.Encode.(array(pair(Data_Id.encode, Data_Id.encode)));

    let toMapReducer = (acc, (id1, id2)) => {
      let newList1 =
        switch (Map.get(acc, id1)) {
        | None => [id2]
        | Some(currentList) => [id2, ...currentList]
        };
      let newList2 =
        switch (Map.get(acc, id2)) {
        | None => [id1]
        | Some(currentList) => [id1, ...currentList]
        };
      acc->Map.set(id1, newList1)->Map.set(id2, newList2);
    };

    let toMap = x => Set.reduce(x, Data_Id.Map.make(), toMapReducer);
  };
};

type t = {
  avoidPairs: Pair.Set.t,
  byeValue: ByeValue.t,
  lastBackup: Js.Date.t,
};

let decode = json =>
  Json.Decode.{
    avoidPairs: json |> field("avoidPairs", Pair.Set.decode),
    byeValue: json |> field("byeValue", ByeValue.decode),
    lastBackup: json |> field("lastBackup", date),
  };

let encode = data =>
  Json.Encode.(
    object_([
      ("avoidPairs", data.avoidPairs |> Pair.Set.encode),
      ("byeValue", data.byeValue |> ByeValue.encode),
      ("lastBackup", data.lastBackup |> date),
    ])
  );

let default = {
  byeValue: ByeValue.Full,
  avoidPairs: Pair.Set.empty,
  lastBackup: Js.Date.fromFloat(0.0),
};
