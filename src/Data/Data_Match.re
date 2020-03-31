/* Not to be confused with `Belt.Result` */
module Result = {
  type t =
    | WhiteWon
    | BlackWon
    | Draw
    | NotSet;

  type color =
    | White
    | Black;

  let toFloat = (score, color) =>
    switch (score) {
    | WhiteWon =>
      switch (color) {
      | White => 1.0
      | Black => 0.0
      }
    | BlackWon =>
      switch (color) {
      | White => 0.0
      | Black => 1.0
      }
    | Draw => 0.5
    /* This loses data, so is a one-way trip. Use with prudence! */
    | NotSet => 0.0
    };

  let toString = score =>
    switch (score) {
    | WhiteWon => "whiteWon"
    | BlackWon => "blackWon"
    | Draw => "draw"
    | NotSet => "notSet"
    };

  let fromString = score =>
    switch (score) {
    | "whiteWon" => WhiteWon
    | "blackWon" => BlackWon
    | "draw" => Draw
    | _ => NotSet
    };

  let encode = data => data->toString->Json.Encode.string;

  let decode = json => json->Json.Decode.string->fromString;
};

type t = {
  id: Data_Id.t,
  whiteId: Data_Id.t,
  blackId: Data_Id.t,
  whiteNewRating: int,
  blackNewRating: int,
  whiteOrigRating: int,
  blackOrigRating: int,
  result: Result.t,
};

let decode = json =>
  Json.Decode.{
    id: json |> field("id", Data_Id.decode),
    whiteId: json |> field("whiteId", Data_Id.decode),
    blackId: json |> field("blackId", Data_Id.decode),
    whiteNewRating: json |> field("whiteNewRating", int),
    blackNewRating: json |> field("blackNewRating", int),
    whiteOrigRating: json |> field("whiteOrigRating", int),
    blackOrigRating: json |> field("blackOrigRating", int),
    result: json |> field("result", Result.decode),
  };

let encode = data =>
  Json.Encode.(
    object_([
      ("id", data.id |> Data_Id.encode),
      ("whiteId", data.whiteId |> Data_Id.encode),
      ("blackId", data.blackId |> Data_Id.encode),
      ("whiteNewRating", data.whiteNewRating |> int),
      ("blackNewRating", data.blackNewRating |> int),
      ("whiteOrigRating", data.whiteOrigRating |> int),
      ("blackOrigRating", data.blackOrigRating |> int),
      ("result", data.result |> Result.encode),
    ])
  );

let byeResultForPlayerColor = (byeValue, color) =>
  Data_Config.ByeValue.(
    Result.(
      switch (byeValue) {
      | Half => Draw
      | Full =>
        switch (color) {
        | White => WhiteWon
        | Black => BlackWon
        }
      }
    )
  );

let scoreByeMatch = (match, ~byeValue) =>
  switch (Data_Id.(isDummy(match.whiteId), isDummy(match.blackId))) {
  | (true, false) => {
      ...match,
      result: byeResultForPlayerColor(byeValue, Result.Black),
    }
  | (false, true) => {
      ...match,
      result: byeResultForPlayerColor(byeValue, Result.White),
    }
  | (true, true) /* Two dummies?! */
  | (false, false) => match
  };

let manualPair = ((white, black), byeValue) => {
  {
    id: Data_Id.random(),
    result: Result.NotSet,
    whiteId: white.Data_Player.id,
    blackId: black.Data_Player.id,
    whiteOrigRating: white.Data_Player.rating,
    blackOrigRating: black.Data_Player.rating,
    whiteNewRating: white.Data_Player.rating,
    blackNewRating: black.Data_Player.rating,
  }
  ->scoreByeMatch(~byeValue);
};

let swapColors = match => {
  let result =
    Result.(
      switch (match.result) {
      | WhiteWon => BlackWon
      | BlackWon => WhiteWon
      | Draw => Draw
      | NotSet => NotSet
      }
    );
  /* This just "reverses" the values. */
  {
    ...match,
    result,
    whiteId: match.blackId,
    blackId: match.whiteId,
    whiteOrigRating: match.blackOrigRating,
    blackOrigRating: match.whiteOrigRating,
    whiteNewRating: match.blackNewRating,
    blackNewRating: match.whiteNewRating,
  };
};
