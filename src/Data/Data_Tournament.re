// open Belt;

type t = {
  byeQueue: array(string),
  date: Js.Date.t,
  id: string,
  name: string,
  playerIds: list(string),
  roundList: Data_Rounds.t,
  tieBreaks: array(int),
};
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
    tieBreaks: json |> field("tieBreaks", array(int)),
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
      ("tieBreaks", data.tieBreaks |> array(int)),
    ])
  );