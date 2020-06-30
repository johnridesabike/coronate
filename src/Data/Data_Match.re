module Id = Data_Id;
module Score = Data_Scoring.Score;

/* Not to be confused with `Belt.Result` */
module Result = {
  type t =
    | WhiteWon
    | BlackWon
    | Draw
    | NotSet;

  let toScoreWhite =
    fun
    | WhiteWon => Score.One
    | BlackWon => Score.Zero
    | Draw => Score.Half
    /* This loses data, so is a one-way trip. Use with prudence! */
    | NotSet => Score.Zero;

  let toScoreBlack =
    fun
    | WhiteWon => Score.Zero
    | BlackWon => Score.One
    | Draw => Score.Half
    /* This loses data, so is a one-way trip. Use with prudence! */
    | NotSet => Score.Zero;

  let toString =
    fun
    | WhiteWon => "whiteWon"
    | BlackWon => "blackWon"
    | Draw => "draw"
    | NotSet => "notSet";

  let fromString =
    fun
    | "whiteWon" => WhiteWon
    | "blackWon" => BlackWon
    | "draw" => Draw
    | _ => NotSet;

  let encode = data => data->toString->Json.Encode.string;

  let decode = json => json->Json.Decode.string->fromString;
};

type t = {
  id: Id.t,
  whiteId: Id.t,
  blackId: Id.t,
  whiteNewRating: int,
  blackNewRating: int,
  whiteOrigRating: int,
  blackOrigRating: int,
  result: Result.t,
};

let decode = json =>
  Json.Decode.{
    id: json |> field("id", Id.decode),
    whiteId: json |> field("whiteId", Id.decode),
    blackId: json |> field("blackId", Id.decode),
    whiteNewRating: json |> field("whiteNewRating", int),
    blackNewRating: json |> field("blackNewRating", int),
    whiteOrigRating: json |> field("whiteOrigRating", int),
    blackOrigRating: json |> field("blackOrigRating", int),
    result: json |> field("result", Result.decode),
  };

let encode = data =>
  Json.Encode.(
    object_([
      ("id", data.id |> Id.encode),
      ("whiteId", data.whiteId |> Id.encode),
      ("blackId", data.blackId |> Id.encode),
      ("whiteNewRating", data.whiteNewRating |> int),
      ("blackNewRating", data.blackNewRating |> int),
      ("whiteOrigRating", data.whiteOrigRating |> int),
      ("blackOrigRating", data.blackOrigRating |> int),
      ("result", data.result |> Result.encode),
    ])
  );

let byeResultForPlayerColor = (byeValue, result) =>
  Data_Config.ByeValue.(
    switch (byeValue) {
    | Half => Result.Draw
    | Full => result
    }
  );

let scoreByeMatch = (match, ~byeValue) =>
  switch (Id.(isDummy(match.whiteId), isDummy(match.blackId))) {
  | (true, false) => {
      ...match,
      result: byeResultForPlayerColor(byeValue, Result.BlackWon),
    }
  | (false, true) => {
      ...match,
      result: byeResultForPlayerColor(byeValue, Result.WhiteWon),
    }
  | (true, true) /* Two dummies?! */
  | (false, false) => match
  };

let manualPair = ((white, black), byeValue) => {
  {
    id: Id.random(),
    result: Result.NotSet,
    whiteId: white.Data_Player.id,
    blackId: black.Data_Player.id,
    whiteOrigRating: white.rating,
    blackOrigRating: black.rating,
    whiteNewRating: white.rating,
    blackNewRating: black.rating,
  }
  ->scoreByeMatch(~byeValue);
};

let swapColors = match => {
  ...match,
  result:
    Result.(
      switch (match.result) {
      | WhiteWon => BlackWon
      | BlackWon => WhiteWon
      | Draw => Draw
      | NotSet => NotSet
      }
    ),
  whiteId: match.blackId,
  blackId: match.whiteId,
  whiteOrigRating: match.blackOrigRating,
  blackOrigRating: match.whiteOrigRating,
  whiteNewRating: match.blackNewRating,
  blackNewRating: match.whiteNewRating,
};
