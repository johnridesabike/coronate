// open Belt;

type t = {
  byeQueue: array(string),
  date: Js.Date.t,
  id: string,
  name: string,
  playerIds: list(string),
  roundList: Data_Rounds.t,
  tieBreaks: array(Scoring.tieBreak),
};

let mapTieBreakName = tieBreak =>
  switch (tieBreak) {
  | Scoring.Median => "Median"
  | Solkoff => "Solkoff"
  | Cumulative => "Cumulative"
  | CumulativeOfOpposition => "Cumulative of opposition"
  | MostBlack => "Most Black"
  };

/*
  Use these to pass the type to the JS side, e.g. in form values.
*/
let tieBreakToString = data =>
  switch (data) {
  | Scoring.Median => "median"
  | Solkoff => "solkoff"
  | Cumulative => "cumulative"
  | CumulativeOfOpposition => "cumulativeofOpposition"
  | MostBlack => "mostBlack"
  };

let tieBreakFromString = json =>
  switch (json) {
  | "median" => Scoring.Median
  | "solkoff" => Solkoff
  | "cumulative" => Cumulative
  | "cumulativeofOpposition" => CumulativeOfOpposition
  | "mostBlack" => MostBlack
  | _ => Median
  };

let encodeTieBreak = data => data |> tieBreakToString |> Json.Encode.string;
let decodeTieBreak = json => json |> Json.Decode.string |> tieBreakFromString;
/*
 LocalForage/IndexedDB sometimes automatically parses the date for us
 already, and I'm not sure how to propertly handle it.
 */
external unsafe_date: Js.Json.t => Js.Date.t = "%identity";
let decode = json =>
  Json.Decode.{
    byeQueue: json |> field("byeQueue", array(string)),
    date: json |> field("date", oneOf([date, unsafe_date])),
    id: json |> field("id", string),
    name: json |> field("name", string),
    playerIds: json |> field("playerIds", list(string)),
    roundList: json |> field("roundList", Data_Rounds.decode),
    tieBreaks: json |> field("tieBreaks", array(decodeTieBreak)),
  };
let encode = data =>
  Json.Encode.(
    object_([
      ("byeQueue", data.byeQueue |> array(string)),
      ("date", data.date |> date),
      ("id", data.id |> string),
      ("name", data.name |> string),
      ("playerIds", data.playerIds |> list(string)),
      ("roundList", data.roundList |> Data_Rounds.encode),
      ("tieBreaks", data.tieBreaks |> array(encodeTieBreak)),
    ])
  );