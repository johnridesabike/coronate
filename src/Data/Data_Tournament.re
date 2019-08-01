// open Belt;

type t = {
  byeQueue: array(string),
  date: Js.Date.t,
  id: string,
  name: string,
  playerIds: array(string),
  roundList: array(array(Data_Match.t)),
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
    playerIds: json |> field("playerIds", array(string)),
    roundList: json |> field("roundList", array(array(Data_Match.decode))),
    tieBreaks: json |> field("tieBreaks", array(int)),
  };
let encode = data =>
  Json.Encode.(
    object_([
      ("byeQueue", data.byeQueue |> stringArray),
      ("date", data.date |> date),
      ("id", data.id |> string),
      ("name", data.name |> string),
      ("playerIds", data.playerIds |> stringArray),
      ("roundList", data.roundList |> array(array(Data_Match.encode))),
      ("tieBreaks", data.tieBreaks |> array(int)),
    ])
  );