open Belt;
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
  let encode = data => data |> toString |> Json.Encode.string;
  let decode = json => json |> Json.Decode.string |> fromString;
};
type t = {
  id: string,
  whiteId: string,
  blackId: string,
  whiteNewRating: int,
  blackNewRating: int,
  whiteOrigRating: int,
  blackOrigRating: int,
  result: Result.t,
};
let decode = json =>
  Json.Decode.{
    id: json |> field("id", string),
    whiteId: json |> field("whiteId", string),
    blackId: json |> field("blackId", string),
    whiteNewRating: json |> field("whiteNewRating", int),
    blackNewRating: json |> field("blackNewRating", int),
    whiteOrigRating: json |> field("whiteOrigRating", int),
    blackOrigRating: json |> field("blackOrigRating", int),
    result: json |> field("result", Result.decode),
  };
let encode = data =>
  Json.Encode.(
    object_([
      ("id", data.id |> string),
      ("whiteId", data.whiteId |> string),
      ("blackId", data.blackId |> string),
      ("whiteNewRating", data.whiteNewRating |> int),
      ("blackNewRating", data.blackNewRating |> int),
      ("whiteOrigRating", data.whiteOrigRating |> int),
      ("blackOrigRating", data.blackOrigRating |> int),
      ("result", data.result |> Result.encode),
    ])
  );

let byeResultForPlayerColor = (byeValue, color) =>
  switch (byeValue) {
  | Data_Config.ByeValue.Half => Result.Draw
  | Full =>
    switch (color) {
    | Result.White => WhiteWon
    | Black => BlackWon
    }
  };

let scoreByeMatch = (byeValue, match) =>
  switch (Data_Player.(isDummyId(match.whiteId), isDummyId(match.blackId))) {
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

let autoPair = (~pairData, ~byeValue, ~playerMap, ~byeQueue) => {
  /* the pairData includes any players who were already matched. We need to
     only include the specified players. */
  let filteredData =
    Map.String.(
      pairData->reduce(empty, (acc, key, datum) =>
        if (playerMap->has(key)) {
          acc->set(key, datum);
        } else {
          acc;
        }
      )
    );
  let (pairdataNoByes, byePlayerData) =
    Pairing.setByePlayer(byeQueue, Data_Player.dummy_id, filteredData);
  let pairs = Pairing.pairPlayers(pairdataNoByes);
  let pairsWithBye =
    switch (byePlayerData) {
    | Some(player) =>
      pairs |> Js.Array.concat([|(player.id, Data_Player.dummy_id)|])
    | None => pairs
    };
  let getPlayer = Data_Player.getPlayerMaybe(playerMap);
  let newMatchList =
    pairsWithBye
    |> Js.Array.map(((whiteId, blackId)) =>
         {
           id: Utils.nanoid(),
           whiteOrigRating: getPlayer(whiteId).rating,
           blackOrigRating: getPlayer(blackId).rating,
           whiteNewRating: getPlayer(whiteId).rating,
           blackNewRating: getPlayer(blackId).rating,
           whiteId,
           blackId,
           result: Result.NotSet,
         }
       );
  newMatchList |> Js.Array.map(scoreByeMatch(byeValue));
};

let manualPair = ((white, black), byeValue) => {
  {
    id: Utils.nanoid(),
    result: Result.NotSet,
    whiteId: white.Data_Player.id,
    blackId: black.Data_Player.id,
    whiteOrigRating: white.rating,
    blackOrigRating: black.rating,
    whiteNewRating: white.rating,
    blackNewRating: black.rating,
  }
  |> scoreByeMatch(byeValue);
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