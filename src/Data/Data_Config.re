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
  let encode = data => data |> toFloat |> Json.Encode.float;
  let decode = json => json |> Json.Decode.float |> fromFloat;
};
module AvoidPairs = {
  module T =
    Id.MakeComparable({
      type t = (string, string);
      let cmp = ((a, b), (c, d)) => {
        let w = String.compare(a, c);
        let x = String.compare(b, d);
        let y = String.compare(a, d);
        let z = String.compare(b, c);
        switch (w, x, y, z) {
        /* Sometimes adding them returns 0 even if they're not equivalent.
           There might be a better way to pattern-match this, but this works. */
        | (1, (-1), 1, (-1))
        | (1, (-1), (-1), 1) => 1
        | ((-1), 1, 1, (-1))
        | ((-1), 1, (-1), 1) => (-1)
        | (w, x, y, z) => w + x + y + z
        };
      };
    });
  type t = Set.t(T.t, T.identity);
  type pair = T.t;
  let empty = Set.make(~id=(module T));
  let fromArray = Set.fromArray(~id=(module T));
  let decode = json =>
    Json.Decode.(json |> array(pair(string, string)))
    |> Set.fromArray(~id=(module T));
  let encode = data =>
    Set.toArray(data) |> Json.Encode.(array(pair(string, string)));
  /*
   Flatten the `(id1, id2), (id1, id3)` structure into an easy-to-access
   `{id1: [id2, id3], id2: [id1], id3: [id1]}` structure.
   */
  let toMapReducer = (acc, (id1, id2)) => {
    let newList1 =
      switch (Map.String.get(acc, id1)) {
      | None => [id2]
      | Some(currentList) => [id2, ...currentList]
      };
    let newList2 =
      switch (Map.String.get(acc, id2)) {
      | None => [id1]
      | Some(currentList) => [id1, ...currentList]
      };
    acc->Map.String.set(id1, newList1)->Map.String.set(id2, newList2);
  };
  let toMap = Set.reduce(_, Map.String.empty, toMapReducer);
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