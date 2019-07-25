open Belt;
/*
 let win = 1.0;
 let loss = 0.0;
 let draw = 0.5;
 */
/* This is used in by matches to indicate a dummy player. The
   `getPlayerMaybe()` method returns a special dummy player profile when
   fetching this ID.
   This ID conforms to the NanoID regex, which currently has no purpose. */
let dummy_id = "________DUMMY________";
type id = string;
/*
 let isNanoId = str => str |> Js.Re.test_([%re "/^[A-Za-z0-9_-]{21}$/"]);
 */
type avoidPair = (string, string);

/*
 Flatten the `[[id1, id2], [id1, id3]]` structure into an easy-to-read
 `{id1: [id2, id3], id2: [id1], id3: [id1]}` structure.
 */
let avoidPairReducer = (acc, (id1, id2)) => {
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

/*
  The jsConverter is useful for importing and exporting types to JSON or
  indexedDB storage. Yes, you can store the plain JS representation of a Reason
  record without such conversions, but the advantage to the conversions is that
  they enable manual editing of the JSON data. Also, the exact way that Reason
  encodes its records to JS is arbitrary. Changing a field can change how the
  whole record gets encoded. The jsConverter helps to give consistency.

  I have not measured the performance impact of these conversions, but it
  doesn't *seem* to be significant. Most of it happens in asyncronous functions
  anyway.
 */
module Player = {
  type t = {
    firstName: string,
    id,
    lastName: string,
    matchCount: int,
    rating: int,
    type_: string // used for CSS styling etc. Default "person".
  };
  let decode = json =>
    Json.Decode.{
      firstName: json |> field("firstName", string),
      id: json |> field("id", string),
      lastName: json |> field("lastName", string),
      matchCount: json |> field("matchCount", int),
      rating: json |> field("rating", int),
      type_: json |> field("type_", string),
    };
  let encode = data =>
    Json.Encode.(
      object_([
        ("firstName", data.firstName |> string),
        ("id", data.id |> string),
        ("lastName", data.lastName |> string),
        ("matchCount", data.matchCount |> int),
        ("rating", data.rating |> int),
        ("type_", data.type_ |> string),
      ])
    );

  // These are useful for passing to `filter()` methods.
  let isDummyId = playerId => playerId == dummy_id;

  // This is the dummy profile that `getPlayerMaybe()` returns for bye rounds.
  let dummyPlayer = {
    id: dummy_id,
    firstName: "Bye",
    lastName: "Player",
    type_: "dummy",
    matchCount: 0,
    rating: 0,
  };

  // If `getPlayerMaybe()` can't find a profile (e.g. if it was deleted) then it
  // outputs this instead. The ID will be the same as missing player's ID.
  let makeMissingPlayer = id => {
    id,
    firstName: "Anonymous",
    lastName: "Player",
    type_: "missing",
    matchCount: 0,
    rating: 0,
  };

  /* This function should always be used in components that *might* not be able to
     display current player information. This includes bye rounds with "dummy"
     players, or scoreboards where a player may have been deleted. */
  let getPlayerMaybe = (playerDict, id) =>
    if (id === dummy_id) {
      dummyPlayer;
    } else {
      switch (playerDict->Js.Dict.get(id)) {
      | None => makeMissingPlayer(id)
      | Some(player) => player
      };
    };
  let getPlayerMaybeMap = (playerMap, id) =>
    if (id === dummy_id) {
      dummyPlayer;
    } else {
      playerMap->Map.String.getWithDefault(id, makeMissingPlayer(id));
    };
};

module Match = {
  type t = {
    id,
    whiteId: id,
    blackId: id,
    whiteNewRating: int,
    blackNewRating: int,
    whiteOrigRating: int,
    blackOrigRating: int,
    whiteScore: float,
    blackScore: float,
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
      whiteScore: json |> field("whiteScore", Json.Decode.float),
      blackScore: json |> field("blackScore", Json.Decode.float),
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
        ("whiteScore", data.whiteScore |> Json.Encode.float),
        ("blackScore", data.blackScore |> Json.Encode.float),
      ])
    );
};

module Tournament = {
  type roundList = array(array(Match.t));
  type t = {
    byeQueue: array(id),
    date: Js.Date.t,
    id,
    name: string,
    playerIds: array(id),
    roundList,
    tieBreaks: array(int),
  };
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

module Config = {
  type t = {
    avoidPairs: array(avoidPair),
    byeValue: float,
    lastBackup: Js.Date.t,
  };
  let decode = json =>
    Json.Decode.{
      avoidPairs: json |> field("avoidPairs", array(pair(string, string))),
      byeValue: json |> field("byeValue", Json.Decode.float),
      lastBackup: json |> field("lastBackup", date),
    };
  let encode = data =>
    Json.Encode.(
      object_([
        ("avoidPairs", data.avoidPairs |> array(pair(string, string))),
        ("byeValue", data.byeValue |> Json.Encode.float),
        ("lastBackup", data.lastBackup |> date),
      ])
    );
  let defaults = {
    byeValue: 1.0,
    avoidPairs: [||],
    lastBackup: Js.Date.fromFloat(0.0),
  };
};

/*******************************************************************************
 * Round functions
 ******************************************************************************/

// This flattens a list of rounds to a list of matches.
// The optional `lastRound` parameter will slice the rounds to only the last
// index specified. For example: if you just want to see the scores through
// round 2 and not include round 3.
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

// This creates a filtered version of `players` with only the players that are
// not matched for the specified round.
let getUnmatched = (roundList, players, roundId) => {
  let matchList = {
    switch (roundList->Array.get(roundId)) {
    | None => [||]
    | Some(round) => round
    };
  };
  // flatten all of the ids from the matches to one list.
  let matchedIds =
    matchList
    |> Js.Array.reduce(
         (acc, match) =>
           acc |> Js.Array.concat([|match.Match.whiteId, match.blackId|]),
         [||],
       );
  players->Map.String.reduce(Map.String.empty, (acc, key, player) =>
    if (!(matchedIds |> Js.Array.includes(key))) {
      acc->Map.String.set(key, player);
    } else {
      acc;
    }
  );
};

let isRoundComplete = (roundList, players, roundId) =>
  if (roundId < Js.Array.length(roundList) - 1) {
    true;
        /* If it's not the last round, it's complete.*/
  } else {
    let unmatched = getUnmatched(roundList, players, roundId);
    let results =
      roundList->Array.getExn(roundId)
      |> Js.Array.map(match => match.Match.whiteScore +. match.blackScore);
    Map.String.size(unmatched) === 0 && !(results |> Js.Array.includes(0.0));
  };

module Converters = {
  /*
    This module is designed to convert types from the `Data` module to types to
    be used in the `Pairing` and `Scoring` module.
   */
  let blackValue = 1.0;
  let whiteValue = (-1.0);

  let black = 1;
  let white = 0;

  let colorToScore = color => color == black ? blackValue : whiteValue;

  let getOppColor = color => color == white ? black : white;

  let dummyId = "________DUMMY________";

  let isDummyId = playerId => playerId == dummyId;

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
    // Get existing score data to update, or create it fresh
    let oldData = {
      switch (existingData->Map.String.get(playerId)) {
      | None => Scoring.createBlankScoreData(playerId)
      | Some(data) => data
      };
    };
    // The ratings will always begin with the `origRating` of the
    // first match they were in.
    let (newRatings, firstRating) =
      switch (oldData.ratings) {
      | [] => ([newRating], origRating)
      | ratings => ([newRating, ...ratings], origRating)
      };
    let newResultsNoByes = {
      isDummyId(oppId)
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
      colorScores: [colorToScore(color), ...oldData.colorScores],
      opponentResults: newOpponentResults,
      ratings: newRatings,
      firstRating,
      isDummy: isDummyId(playerId),
      id: playerId,
    };
  };

  let matches2ScoreData = matchList => {
    matchList
    |> Js.Array.reduce(
         (acc, match) => {
           let newDataWhite =
             makeScoreData(
               ~existingData=acc,
               ~playerId=match.Match.whiteId,
               ~origRating=match.whiteOrigRating,
               ~newRating=match.whiteNewRating,
               ~result=match.whiteScore,
               ~oppId=match.blackId,
               ~color=white,
             );
           let newDataBlack =
             makeScoreData(
               ~existingData=acc,
               ~playerId=match.blackId,
               ~origRating=match.blackOrigRating,
               ~newRating=match.blackNewRating,
               ~result=match.blackScore,
               ~oppId=match.whiteId,
               ~color=black,
             );
           acc
           ->Map.String.set(match.whiteId, newDataWhite)
           ->Map.String.set(match.blackId, newDataBlack);
         },
         Map.String.empty,
       );
  };

  let createPairingData = (playerData, avoidPairs, scoreMap) => {
    open Player;
    let avoidMap =
      avoidPairs |> Js.Array.reduce(avoidPairReducer, Map.String.empty);
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
        let newData: Pairing.t = {
          avoidIds: newAvoidIds,
          colorScores: playerStats.colorScores,
          colors: playerStats.colors,
          halfPos: 0,
          id: data.id,
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