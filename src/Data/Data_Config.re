open Belt;

module ByeValue = {
  type t =
    | Full
    | Half;

  let toFloat = data =>
    switch (data) {
    | Full => 1.0
    | Half => 0.5
    };

  let fromFloat = json =>
    switch (json) {
    | 1.0 => Full
    | 0.5 => Half
    | _ => Full
    };

  let encode = data => data->toFloat->Json.Encode.float;

  let decode = json => json->Json.Decode.float->fromFloat;
};

module AvoidPairs = {
  type pair = (Data_Id.t, Data_Id.t);

  module T =
    Belt.Id.MakeComparable({
      type t = pair;
      let cmp: (t, t) => int =
        ((a, b), (c, d)) => {
          let w = Data_Id.compare(a, c);
          let x = Data_Id.compare(b, d);
          let y = Data_Id.compare(a, d);
          let z = Data_Id.compare(b, c);
          switch (w, x, y, z) {
          /* Sometimes adding them returns 0 even if they're not equivalent.
               There might be a better way to pattern-match this, but this works.
             */
          | (1, (-1), 1, (-1))
          | (1, (-1), (-1), 1) => 1
          | ((-1), 1, 1, (-1))
          | ((-1), 1, (-1), 1) => (-1)
          | (w, x, y, z) => w + x + y + z
          };
        };
    });

  type t = Set.t(T.t, T.identity);

  external fromStringArray: array((string, string)) => array(pair) =
    "%identity";

  let empty = Set.make(~id=(module T));

  let fromStringArray = a =>
    a->fromStringArray->Set.fromArray(~id=(module T));

  let fromArray = Set.fromArray(~id=(module T));

  let decode = json =>
    Json.Decode.(json |> array(pair(Data_Id.decode, Data_Id.decode)))
    ->fromArray;

  let encode = data =>
    Set.toArray(data)
    |> Json.Encode.(array(pair(Data_Id.encode, Data_Id.encode)));

  /**
   * Flatten the `(id1, id2), (id1, id3)` structure into an easy-to-access
   * `{id1: [id2, id3], id2: [id1], id3: [id1]}` structure.
   */
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

  let toMap = Set.reduce(_, Data_Id.Map.make(), toMapReducer);
};

type t = {
  avoidPairs: AvoidPairs.t,
  byeValue: ByeValue.t,
  lastBackup: Js.Date.t,
};

let decode = json =>
  Json.Decode.{
    avoidPairs: json |> field("avoidPairs", AvoidPairs.decode),
    byeValue: json |> field("byeValue", ByeValue.decode),
    lastBackup: json |> field("lastBackup", date),
  };

let encode = data =>
  Json.Encode.(
    object_([
      ("avoidPairs", data.avoidPairs |> AvoidPairs.encode),
      ("byeValue", data.byeValue |> ByeValue.encode),
      ("lastBackup", data.lastBackup |> date),
    ])
  );

let default = {
  byeValue: ByeValue.Full,
  avoidPairs: AvoidPairs.empty,
  lastBackup: Js.Date.fromFloat(0.0),
};
