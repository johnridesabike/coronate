open Belt;
type id = string;
/*
 let isNanoId = str => str |> Js.Re.test_([%re "/^[A-Za-z0-9_-]{21}$/"]);
 */

module Player = {
  module Type = {
    /*
      These are mainly used for CSS styling.
     */
    type t =
      | Person
      | Dummy
      | Missing;
    let toString = data =>
      switch (data) {
      | Person => "person"
      | Dummy => "dummy"
      | Missing => "missing"
      };
    let fromString = str =>
      switch (str) {
      | "person" => Person
      | "dummy" => Dummy
      | "missing" => Missing
      | _ => Person
      };
    let encode = data => data |> toString |> Json.Encode.string;
    let decode = data => data |> Json.Decode.string |> fromString;
  };

  type t = {
    firstName: string,
    id,
    lastName: string,
    matchCount: int,
    rating: int,
    type_: Type.t,
  };
  let decode = json =>
    Json.Decode.{
      firstName: json |> field("firstName", string),
      id: json |> field("id", string),
      lastName: json |> field("lastName", string),
      matchCount: json |> field("matchCount", int),
      rating: json |> field("rating", int),
      type_: json |> field("type_", Type.decode),
    };
  let encode = data =>
    Json.Encode.(
      object_([
        ("firstName", data.firstName |> string),
        ("id", data.id |> string),
        ("lastName", data.lastName |> string),
        ("matchCount", data.matchCount |> int),
        ("rating", data.rating |> int),
        ("type_", data.type_ |> Type.encode),
      ])
    );

  /*
    This is used in by matches to indicate a dummy player. The `getPlayerMaybe`
    function returns a special dummy player profile when fetching this ID.
    This ID conforms to the NanoID regex, which currently has no purpose.
   */
  let dummy_id = "________DUMMY________";
  /* This are useful for passing to `filter()` methods.*/
  let isDummyId = playerId => playerId === dummy_id;

  /* This is the dummy profile that `getPlayerMaybe()` returns for bye rounds.*/
  let dummyPlayer = {
    id: dummy_id,
    firstName: "Bye",
    lastName: "Player",
    type_: Type.Dummy,
    matchCount: 0,
    rating: 0,
  };

  /*
    If `getPlayerMaybe()` can't find a profile (e.g. if it was deleted) then it
    outputs this instead. The ID will be the same as missing player's ID.
   */
  let makeMissingPlayer = id => {
    id,
    firstName: "Anonymous",
    lastName: "Player",
    type_: Type.Missing,
    matchCount: 0,
    rating: 0,
  };

  /* This function should always be used in components that *might* not be able to
     display current player information. This includes bye rounds with "dummy"
     players, or scoreboards where a player may have been deleted. */
  let getPlayerMaybe = (playerMap, id) =>
    if (id === dummy_id) {
      dummyPlayer;
    } else {
      playerMap->Map.String.getWithDefault(id, makeMissingPlayer(id));
    };
};

module Match = {
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
    id,
    whiteId: id,
    blackId: id,
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
};

module Tournament = {
  type t = {
    byeQueue: array(id),
    date: Js.Date.t,
    id,
    name: string,
    playerIds: array(id),
    roundList: array(array(Match.t)),
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
      roundList: json |> field("roundList", array(array(Match.decode))),
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
        ("roundList", data.roundList |> array(array(Match.encode))),
        ("tieBreaks", data.tieBreaks |> array(int)),
      ])
    );
};

module ByeValue = {
  type t =
    | Full
    | Half;
  let toJson = data =>
    switch (data) {
    | Full => 1.0
    | Half => 0.5
    };
  let fromJson = json =>
    switch (json) {
    | 1.0 => Full
    | 0.5 => Half
    | _ => Full
    };
  let encode = data => data |> toJson |> Json.Encode.float;
  let decode = json => json |> Json.Decode.float |> fromJson;
  let resultForPlayerColor = (byeValue, color) =>
    Match.Result.(
      switch (byeValue) {
      | Half => Draw
      | Full =>
        switch (color) {
        | White => WhiteWon
        | Black => BlackWon
        }
      }
    );
};

module AvoidPairs = {
  module T =
    Id.MakeComparable({
      type t = (id, id);
      let cmp = ((a, b), (c, d)) => {
        let w = compare(a, c);
        let x = compare(b, d);
        let y = compare(a, d);
        let z = compare(b, c);
        switch (w + x + y + z) {
        /*
         Sometimes adding them returns 0 even if they're not equivalent.
         (e.g.: 1, -1, 1, -1) So we're just turning 0 into 1.
         There's probably a prettier way to pattern-match it, but this works.
         */
        | 0 when w !== 0 && x !== 0 && y !== 0 && z !== 0 => 1
        | x => x
        };
      };
    });
  type t = Set.t(T.t, T.identity);
  type pair = T.t;
  let make = () => Set.make(~id=(module T));
  let decode = json =>
    Json.Decode.(json |> array(pair(string, string)))
    ->Set.fromArray(~id=(module T));
  let encode = data =>
    Set.toArray(data) |> Json.Encode.(array(pair(string, string)));
  /*
   Flatten the `[[id1, id2], [id1, id3]]` structure into an easy-to-read
   `{id1: [id2, id3], id2: [id1], id3: [id1]}` structure.
   */
  let reduceToMap = (acc, (id1, id2)) => {
    let newList1 =
      switch (acc->Map.String.get(id1)) {
      | None => [id2]
      | Some(currentList) => [id2, ...currentList]
      };
    let newList2 =
      switch (acc->Map.String.get(id2)) {
      | None => [id1]
      | Some(currentList) => [id1, ...currentList]
      };
    acc->Map.String.set(id1, newList1)->Map.String.set(id2, newList2);
  };
};

module Config = {
  type t = {
    avoidPairs: AvoidPairs.t,
    byeValue: ByeValue.t,
    lastBackup: Js.Date.t,
  };
  let decode = json =>
    Json.Decode.{
      avoidPairs: json |> field("avoidPairs", AvoidPairs.decode),
      byeValue: json |> field("byeValue", ByeValue.decode),
      lastBackup: json |> field("lastBackup", date),
    };
  let encode = data =>
    Json.Encode.(
      object_([
        ("avoidPairs", data.avoidPairs |> AvoidPairs.encode),
        ("byeValue", data.byeValue |> ByeValue.encode),
        ("lastBackup", data.lastBackup |> date),
      ])
    );
  let defaults = {
    byeValue: Full,
    avoidPairs: AvoidPairs.make(),
    lastBackup: Js.Date.fromFloat(0.0),
  };
};

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
    switch (roundList->Array.get(roundId)) {
    | None => [||]
    | Some(round) => round
    };
  };
  /* flatten all of the ids from the matches to one list.*/
  let matchedIds =
    matchList
    |> Js.Array.reduce(
         (acc, match) =>
           acc |> Js.Array.concat([|match.Match.whiteId, match.blackId|]),
         [||],
       );
  players->Map.String.reduce(Map.String.empty, (acc, key, player) =>
    if (matchedIds |> Js.Array.includes(key)) {
      acc;
    } else {
      acc->Map.String.set(key, player);
    }
  );
};

let isRoundComplete = (roundList, players, roundId) =>
  /* If it's not the last round, it's complete.*/
  if (roundId < Js.Array.length(roundList) - 1) {
    true;
  } else {
    let unmatched = getUnmatched(roundList, players, roundId);
    let results =
      roundList->Array.getExn(roundId)
      |> Js.Array.map(match => match.Match.result);
    Map.String.size(unmatched) === 0
    && !(results |> Js.Array.includes(Match.Result.NotSet));
  };

module Converters = {
  /*
    This module is designed to convert types from the `Data` module to types to
    be used in the `Pairing` and `Scoring` module.
   */

  let makeScoreData =
      (
        ~existingData,
        ~playerId,
        ~origRating,
        ~newRating,
        ~result,
        ~oppId,
        ~color,
      ) => {
    let oldData = {
      switch (existingData->Map.String.get(playerId)) {
      | None => Scoring.createBlankScoreData(playerId)
      | Some(data) => data
      };
    };
    /*
     The ratings will always begin with the `origRating` of the  first match
     they were in.
     */
    let (newRatings, firstRating) =
      switch (oldData.ratings) {
      | [] => ([newRating], origRating)
      | ratings => ([newRating, ...ratings], origRating)
      };
    let newResultsNoByes = {
      Player.isDummyId(oppId)
        ? oldData.resultsNoByes : [result, ...oldData.resultsNoByes];
    };
    let oldOppResults = oldData.opponentResults;
    let oppResult = {
      switch (oldOppResults->Map.String.get(oppId)) {
      | None => result
      | Some(x) => x +. result
      };
    };
    let newOpponentResults = oldOppResults->Map.String.set(oppId, oppResult);
    Scoring.{
      results: [result, ...oldData.results],
      resultsNoByes: newResultsNoByes,
      colors: [color, ...oldData.colors],
      colorScores: [Color.toScore(color), ...oldData.colorScores],
      opponentResults: newOpponentResults,
      ratings: newRatings,
      firstRating,
      isDummy: Player.isDummyId(playerId),
      id: playerId,
    };
  };

  let matches2ScoreData = matchList => {
    matchList
    |> Js.Array.reduce(
         (acc, match) => {
           open Match;
           let newDataWhite =
             makeScoreData(
               ~existingData=acc,
               ~playerId=match.whiteId,
               ~origRating=match.whiteOrigRating,
               ~newRating=match.whiteNewRating,
               ~result=match.result->Match.Result.(toFloat(White)),
               ~oppId=match.blackId,
               ~color=Scoring.Color.White,
             );
           let newDataBlack =
             makeScoreData(
               ~existingData=acc,
               ~playerId=match.blackId,
               ~origRating=match.blackOrigRating,
               ~newRating=match.blackNewRating,
               ~result=match.result->Match.Result.(toFloat(Black)),
               ~oppId=match.whiteId,
               ~color=Scoring.Color.Black,
             );
           acc
           ->Map.String.set(match.whiteId, newDataWhite)
           ->Map.String.set(match.blackId, newDataBlack);
         },
         Map.String.empty,
       );
  };

  let createPairingData = (playerData, avoidPairs, scoreMap) => {
    let avoidMap =
      avoidPairs->Set.reduce(Map.String.empty, AvoidPairs.reduceToMap);
    playerData->Map.String.reduce(
      Map.String.empty,
      (acc, key, data) => {
        let playerStats = {
          switch (scoreMap->Map.String.get(key)) {
          | None => Scoring.createBlankScoreData(key)
          | Some(x) => x
          };
        };
        let newAvoidIds = {
          switch (avoidMap->Map.String.get(key)) {
          | None => []
          | Some(x) => x
          };
        };
        /* `isUpperHalf` and `halfPos` will have to be set by another
           function later. */
        let newData =
          Pairing.{
            avoidIds: newAvoidIds,
            colorScores: playerStats.colorScores,
            colors: playerStats.colors,
            halfPos: 0,
            id: data.Player.id,
            isUpperHalf: false,
            opponents:
              playerStats.opponentResults
              ->Map.String.keysToArray
              ->List.fromArray,
            rating: data.rating,
            score: playerStats.results->Utils.List.sumF,
          };
        acc->Map.String.set(key, newData);
      },
    );
  };
};