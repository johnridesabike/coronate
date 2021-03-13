module Id = Data_Id
module Score = Data_Scoring.Score

/* Not to be confused with `Belt.Result` */
module Result = {
  type t =
    | WhiteWon
    | BlackWon
    | Draw
    | NotSet

  let toScoreWhite = (x): Score.t =>
    switch x {
    | WhiteWon => One
    | BlackWon => Zero
    | Draw => Half
    /* This loses data, so is a one-way trip. Use with prudence! */
    | NotSet => Zero
    }

  let toScoreBlack = (x): Score.t =>
    switch x {
    | WhiteWon => Zero
    | BlackWon => One
    | Draw => Half
    /* This loses data, so is a one-way trip. Use with prudence! */
    | NotSet => Zero
    }

  let toString = x =>
    switch x {
    | WhiteWon => "whiteWon"
    | BlackWon => "blackWon"
    | Draw => "draw"
    | NotSet => "notSet"
    }

  let fromString = x =>
    switch x {
    | "whiteWon" => WhiteWon
    | "blackWon" => BlackWon
    | "draw" => Draw
    | _ => NotSet
    }

  let encode = data => data->toString->Json.Encode.string

  let decode = json => json->Json.Decode.string->fromString
}

type t = {
  id: Id.t,
  whiteId: Id.t,
  blackId: Id.t,
  whiteNewRating: int,
  blackNewRating: int,
  whiteOrigRating: int,
  blackOrigRating: int,
  result: Result.t,
}

let decode = json => {
  open Json.Decode
  {
    id: json |> field("id", Id.decode),
    whiteId: json |> field("whiteId", Id.decode),
    blackId: json |> field("blackId", Id.decode),
    whiteNewRating: json |> field("whiteNewRating", int),
    blackNewRating: json |> field("blackNewRating", int),
    whiteOrigRating: json |> field("whiteOrigRating", int),
    blackOrigRating: json |> field("blackOrigRating", int),
    result: json |> field("result", Result.decode),
  }
}

let encode = data => {
  open Json.Encode
  object_(list{
    ("id", data.id |> Id.encode),
    ("whiteId", data.whiteId |> Id.encode),
    ("blackId", data.blackId |> Id.encode),
    ("whiteNewRating", data.whiteNewRating |> int),
    ("blackNewRating", data.blackNewRating |> int),
    ("whiteOrigRating", data.whiteOrigRating |> int),
    ("blackOrigRating", data.blackOrigRating |> int),
    ("result", data.result |> Result.encode),
  })
}

let byeResultForPlayerColor = (byeValue: Data_Config.ByeValue.t, result): Result.t =>
  switch byeValue {
  | Half => Draw
  | Full => result
  }

let scoreByeMatch = (match_, ~byeValue) =>
  switch (Id.isDummy(match_.whiteId), Id.isDummy(match_.blackId)) {
  | (true, false) => {
      ...match_,
      result: byeResultForPlayerColor(byeValue, BlackWon),
    }
  | (false, true) => {
      ...match_,
      result: byeResultForPlayerColor(byeValue, WhiteWon),
    }
  | (true, true) /* Two dummies?! */
  | (false, false) => match_
  }

let manualPair = ((white: Data_Player.t, black: Data_Player.t), byeValue) =>
  {
    id: Id.random(),
    result: NotSet,
    whiteId: white.id,
    blackId: black.id,
    whiteOrigRating: white.rating,
    blackOrigRating: black.rating,
    whiteNewRating: white.rating,
    blackNewRating: black.rating,
  }->scoreByeMatch(~byeValue)

let swapColors = match_ => {
  ...match_,
  result: switch match_.result {
  | WhiteWon => BlackWon
  | BlackWon => WhiteWon
  | Draw => Draw
  | NotSet => NotSet
  },
  whiteId: match_.blackId,
  blackId: match_.whiteId,
  whiteOrigRating: match_.blackOrigRating,
  blackOrigRating: match_.whiteOrigRating,
  whiteNewRating: match_.blackNewRating,
  blackNewRating: match_.whiteNewRating,
}
