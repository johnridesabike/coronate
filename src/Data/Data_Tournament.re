type t = {
  id: Data_Id.t,
  name: string,
  date: Js.Date.t,
  playerIds: list(Data_Id.t),
  byeQueue: array(Data_Id.t),
  tieBreaks: array(Scoring.TieBreak.t),
  roundList: Data_Rounds.t,
};


/**
 * LocalForage/IndexedDB sometimes automatically parses the date for us
 * already, and I'm not sure how to propertly handle it.
 */
external unsafe_date: Js.Json.t => Js.Date.t = "%identity";

let decode = json =>
  Json.Decode.{
    id: json |> field("id", Data_Id.decode),
    name: json |> field("name", string),
    date: json |> field("date", oneOf([date, unsafe_date])),
    playerIds: json |> field("playerIds", list(Data_Id.decode)),
    byeQueue: json |> field("byeQueue", array(Data_Id.decode)),
    tieBreaks: json |> field("tieBreaks", array(Scoring.TieBreak.decode)),
    roundList: json |> field("roundList", Data_Rounds.decode),
  };

let encode = data =>
  Json.Encode.(
    object_([
      ("id", data.id |> Data_Id.encode),
      ("name", data.name |> string),
      ("date", data.date |> date),
      ("playerIds", data.playerIds |> list(Data_Id.encode)),
      ("byeQueue", data.byeQueue |> array(Data_Id.encode)),
      ("tieBreaks", data.tieBreaks |> array(Scoring.TieBreak.encode)),
      ("roundList", data.roundList |> Data_Rounds.encode),
    ])
  );
