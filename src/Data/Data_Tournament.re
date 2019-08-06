// open Belt;

type t = {
  id: string,
  name: string,
  date: Js.Date.t,
  playerIds: list(string),
  byeQueue: array(string),
  tieBreaks: array(Scoring.tieBreak),
  roundList: Data_Rounds.t,
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
  | CumulativeOfOpposition => "cumulativeOfOpposition"
  | MostBlack => "mostBlack"
  };

let tieBreakFromString = json =>
  switch (json) {
  | "median" => Scoring.Median
  | "solkoff" => Solkoff
  | "cumulative" => Cumulative
  | "cumulativeOfOpposition" => CumulativeOfOpposition
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
    id: json |> field("id", string),
    name: json |> field("name", string),
    date: json |> field("date", oneOf([date, unsafe_date])),
    playerIds: json |> field("playerIds", list(string)),
    byeQueue: json |> field("byeQueue", array(string)),
    tieBreaks: json |> field("tieBreaks", array(decodeTieBreak)),
    roundList: json |> field("roundList", Data_Rounds.decode),
  };
let encode = data =>
  Json.Encode.(
    object_([
      ("id", data.id |> string),
      ("name", data.name |> string),
      ("date", data.date |> date),
      ("playerIds", data.playerIds |> list(string)),
      ("byeQueue", data.byeQueue |> array(string)),
      ("tieBreaks", data.tieBreaks |> array(encodeTieBreak)),
      ("roundList", data.roundList |> Data_Rounds.encode),
    ])
  );