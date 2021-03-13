open Belt

type t = {
  id: Data_Id.t,
  name: string,
  date: Js.Date.t,
  playerIds: list<Data_Id.t>,
  scoreAdjustments: Data_Id.Map.t<float>,
  byeQueue: array<Data_Id.t>,
  tieBreaks: array<Data_Scoring.TieBreak.t>,
  roundList: Data_Rounds.t,
}

let make = (~id, ~name) => {
  id: id,
  name: name,
  byeQueue: [],
  date: Js.Date.make(),
  playerIds: list{},
  scoreAdjustments: Data_Id.Map.make(),
  roundList: Data_Rounds.empty,
  tieBreaks: [Median, Solkoff, Cumulative, CumulativeOfOpposition],
}

@ocaml.doc("
 * LocalForage/IndexedDB sometimes automatically parses the date for us
 * already, and I'm not sure how to propertly handle it.
 ")
external unsafe_date: Js.Json.t => Js.Date.t = "%identity"

let decode = json => {
  open Json.Decode
  {
    id: json |> field("id", Data_Id.decode),
    name: json |> field("name", string),
    date: json |> field("date", oneOf(list{date, unsafe_date})),
    playerIds: json |> field("playerIds", list(Data_Id.decode)),
    byeQueue: json |> field("byeQueue", array(Data_Id.decode)),
    tieBreaks: json |> field("tieBreaks", array(Data_Scoring.TieBreak.decode)),
    roundList: json |> field("roundList", Data_Rounds.decode),
    scoreAdjustments: json
    |> optional(field("scoreAdjustments", array(tuple2(Data_Id.decode, Json.Decode.float))))
    |> Option.mapWithDefault(_, Data_Id.Map.make(), Data_Id.Map.fromArray),
  }
}

let encode = data => {
  open Json.Encode
  object_(list{
    ("id", data.id |> Data_Id.encode),
    ("name", data.name |> string),
    ("date", data.date |> date),
    ("playerIds", data.playerIds |> list(Data_Id.encode)),
    ("byeQueue", data.byeQueue |> array(Data_Id.encode)),
    ("tieBreaks", data.tieBreaks |> array(Data_Scoring.TieBreak.encode)),
    ("roundList", data.roundList |> Data_Rounds.encode),
    (
      "scoreAdjustments",
      data.scoreAdjustments |> Map.toArray |> array(tuple2(Data_Id.encode, Json.Encode.float)),
    ),
  })
}
