module ByeValue = {
  type t =
    | Full
    | Half

  let toFloat = x =>
    switch x {
    | Full => 1.0
    | Half => 0.5
    }

  let fromFloat = x =>
    switch x {
    | 1.0 => Full
    | 0.5 => Half
    | _ => Full
    }

  let encode = data => data->toFloat->Json.Encode.float

  @raises(DecodeError)
  let decode = json => json->Json.Decode.float->fromFloat
}

type t = {
  avoidPairs: Data_Id.Pair.Set.t,
  byeValue: ByeValue.t,
  lastBackup: Js.Date.t,
}

@raises(DecodeError)
let decode = json => {
  open Json.Decode
  {
    avoidPairs: json |> field("avoidPairs", Data_Id.Pair.Set.decode),
    byeValue: json |> field("byeValue", ByeValue.decode),
    lastBackup: json |> field("lastBackup", date),
  }
}

let encode = data => {
  open Json.Encode
  object_(list{
    ("avoidPairs", data.avoidPairs |> Data_Id.Pair.Set.encode),
    ("byeValue", data.byeValue |> ByeValue.encode),
    ("lastBackup", data.lastBackup |> date),
  })
}

let default = {
  byeValue: Full,
  avoidPairs: Belt.Set.make(~id=Data_Id.Pair.id),
  lastBackup: Js.Date.fromFloat(0.0),
}
