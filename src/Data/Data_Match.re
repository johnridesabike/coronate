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
  | Data_ByeValue.Half => Result.Draw
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
    Belt.Map.String.(
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

let setResult = (~matchId, ~result, ~roundId, ~roundList, ~newRatings) => {
  /* This is a lot of nested values, but right now I'm not sure what the
     easier way of doing this is*/
  /* I don't actually know if this copy is necessary */
  let (whiteNewRating, blackNewRating) = newRatings;
  let roundList = Js.Array.copy(roundList);
  Js.Array.(
    roundList->unsafe_set(roundId, roundList->unsafe_get(roundId) |> copy)
  );
  let matchIndex =
    Js.Array.(
      roundList->unsafe_get(roundId)
      |> findIndex(match => match.id === matchId)
    );
  let match = Belt.Array.(roundList->getExn(roundId)->getExn(matchIndex));
  Belt.Array.(
    roundList
    ->getExn(roundId)
    ->set(matchIndex, {...match, result, whiteNewRating, blackNewRating})
    |> ignore
  );
  roundList;
};

let swapColors = (~matchId, ~roundId, ~roundList) => {
  /* I don't actually know if this copy is necessary */
  let roundList = roundList |> Js.Array.copy;
  Js.Array.(
    roundList->unsafe_set(roundId, roundList->unsafe_get(roundId) |> copy)
  );
  let matchIndex =
    Js.Array.(
      roundList->unsafe_get(roundId)
      |> findIndex(match => match.id === matchId)
    );
  let oldMatch =
    Js.Array.(roundList->unsafe_get(roundId)->unsafe_get(matchIndex));
  let result =
    Result.(
      switch (oldMatch.result) {
      | WhiteWon => BlackWon
      | BlackWon => WhiteWon
      | Draw => Draw
      | NotSet => NotSet
      }
    );
  /* This just reverses the values */
  Belt.Array.(
    roundList
    ->getExn(roundId)
    ->set(
        matchIndex,
        {
          ...oldMatch,
          result,
          whiteId: oldMatch.blackId,
          blackId: oldMatch.whiteId,
          whiteOrigRating: oldMatch.blackOrigRating,
          blackOrigRating: oldMatch.whiteOrigRating,
          whiteNewRating: oldMatch.blackNewRating,
          blackNewRating: oldMatch.whiteNewRating,
        },
      )
    |> ignore
  );
  roundList;
};

let updateByeScores = (~newValue, ~roundList) =>
  Js.Array.(
    roundList
    |> map(round => round |> map(match => match |> scoreByeMatch(newValue)))
  );

/*******************************************************************************
 * Round functions
 ******************************************************************************/

/*
 This flattens a list of rounds to a list of matches.
 The optional `lastRound` parameter will slice the rounds to only the last
 index specified. For example: if you just want to see the scores through
 round 2 and not include round 3.
 */
let rounds2Matches = (~roundList, ~lastRound=?, ()) => {
  let rounds = {
    switch (lastRound) {
    | None => roundList
    | Some(num) => roundList->Js.Array.slice(~start=0, ~end_=num + 1)
    };
  };
  rounds
  |> Js.Array.reduce((acc, round) => acc |> Js.Array.concat(round), [||]);
};

/*
 This creates a filtered version of `players` with only the players that are
 not matched for the specified round.
 */
let getUnmatched = (roundList, players, roundId) => {
  let matchList = {
    switch (roundList->Belt.Array.get(roundId)) {
    | None => [||]
    | Some(round) => round
    };
  };
  /* flatten all of the ids from the matches to one list.*/
  let matchedIds =
    matchList
    |> Js.Array.reduce(
         (acc, match) =>
           acc |> Js.Array.concat([|match.whiteId, match.blackId|]),
         [||],
       );
  Belt.Map.String.(
    players->reduce(empty, (acc, key, player) =>
      if (matchedIds |> Js.Array.includes(key)) {
        acc;
      } else {
        acc->set(key, player);
      }
    )
  );
};

let isRoundComplete = (roundList, players, roundId) =>
  /* If it's not the last round, it's complete.*/
  if (roundId < Js.Array.length(roundList) - 1) {
    true;
  } else {
    let unmatched = getUnmatched(roundList, players, roundId);
    let results =
      roundList->Belt.Array.getExn(roundId)
      |> Js.Array.map(match => match.result);
    Belt.Map.String.size(unmatched) === 0
    && !(results |> Js.Array.includes(Result.NotSet));
  };

let addRound = roundList => roundList |> Js.Array.concat([|[||]|]);
let delLastRound = roundList =>
  roundList |> Js.Array.slice(~start=0, ~end_=-1);

let addMatches = (roundList, roundId, matches) => {
  open Js.Array;
  let newRoundList = copy(roundList);
  newRoundList->unsafe_set(
    roundId,
    newRoundList->unsafe_get(roundId) |> concat(matches),
  );
  newRoundList;
};