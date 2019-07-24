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
let avoidPairReducer = (acc, pair) => {
  let (id1, id2) = pair;
  let newList1 = {
    switch (acc->Map.String.get(id1)) {
    | None => [id2]
    | Some(currentList1) => [id2, ...currentList1]
    };
  };
  let newList2 = {
    switch (acc->Map.String.get(id2)) {
    | None => [id1]
    | Some(currentList2) => [id1, ...currentList2]
    };
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
  [@bs.deriving jsConverter]
  type t = {
    firstName: string,
    id,
    lastName: string,
    matchCount: int,
    rating: int,
    type_: string // used for CSS styling etc. Default "person".
  };
  type js = {
    .
    "firstName": string,
    "id": string,
    "lastName": string,
    "matchCount": int,
    "rating": int,
    "type_": string,
  };
  type localForage = js;
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
  [@bs.deriving jsConverter]
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
  type js = {
    .
    "id": id,
    "whiteId": id,
    "blackId": id,
    "whiteNewRating": int,
    "blackNewRating": int,
    "whiteOrigRating": int,
    "blackOrigRating": int,
    "whiteScore": float,
    "blackScore": float,
  };
};

module Tournament = {
  type roundList = array(array(Match.t));
  [@bs.deriving jsConverter]
  type t = {
    byeQueue: array(id),
    date: Js.Date.t,
    id,
    name: string,
    playerIds: array(id),
    roundList,
    tieBreaks: array(int),
  };
  type js = {
    .
    "byeQueue": array(id),
    "date": Js.Date.t,
    "id": id,
    "name": string,
    "playerIds": array(id),
    "roundList": array(array(Match.js)),
    "tieBreaks": array(int),
  };
  type localForage = js;
  /* This is almost exactly like the `js` type, except for the date field*/
  type json = {
    .
    "byeQueue": array(id),
    "date": string,
    "id": id,
    "name": string,
    "playerIds": array(id),
    "roundList": array(array(Match.js)),
    "tieBreaks": array(int),
  };
  /* The built in jsConverter only does a shallow conversion, for technical and
     uninteresting reasons. We need it to deeply convert the `roundList` field,
     so that's where this function comes in.

     Also, this is yet-another reason why managing nested records in state are a
     pain point. (For more fun functions that have to wrangle this, see the
     `TournamentDataReducers` module.) Is there a better way to organize this?
     */
  let tToJsDeep = (tourney: t): js => {
    "byeQueue": tourney.byeQueue,
    "date": tourney.date,
    "id": tourney.id,
    "name": tourney.name,
    "playerIds": tourney.playerIds,
    "roundList":
      tourney.roundList
      |> Js.Array.map(round => round |> Js.Array.map(Match.tToJs)),
    "tieBreaks": tourney.tieBreaks,
  };
  let tFromJsDeep = (tourney: js) => {
    byeQueue: tourney##byeQueue,
    date: tourney##date,
    id: tourney##id,
    name: tourney##name,
    playerIds: tourney##playerIds,
    roundList:
      tourney##roundList
      |> Js.Array.map(round => round |> Js.Array.map(Match.tFromJs)),
    tieBreaks: tourney##tieBreaks,
  };
  /* Exactly like the `tFromJsDeep` function, except for the date field*/
  let tFromJsonDeep = (tourney: json) => {
    byeQueue: tourney##byeQueue,
    date: Js.Date.fromString(tourney##date),
    id: tourney##id,
    name: tourney##name,
    playerIds: tourney##playerIds,
    roundList:
      tourney##roundList
      |> Js.Array.map(round => round |> Js.Array.map(Match.tFromJs)),
    tieBreaks: tourney##tieBreaks,
  };
};

module Config = {
  [@bs.deriving jsConverter]
  type t = {
    avoidPairs: array(avoidPair),
    byeValue: float,
    lastBackup: Js.Date.t,
  };
  type js = {
    .
    "avoidPairs": array(avoidPair),
    "byeValue": float,
    "lastBackup": Js.Date.t,
  };
  type localForage = js;

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
let rounds2Matches = (~roundList: Tournament.roundList, ~lastRound=?, ()) => {
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
let getUnmatched = (roundList: Tournament.roundList, players, roundId) => {
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
         (acc, match: Match.t) =>
           acc |> Js.Array.concat([|match.whiteId, match.blackId|]),
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

let isRoundComplete = (roundList: Tournament.roundList, players, roundId) =>
  if (roundId < Js.Array.length(roundList) - 1) {
    true;
        /* If it's not the last round, it's complete.*/
  } else {
    let unmatched = getUnmatched(roundList, players, roundId);
    let results =
      roundList->Array.getExn(roundId)
      |> Js.Array.map((match: Match.t) =>
           match.whiteScore +. match.blackScore
         );
    unmatched->Map.String.keysToArray
    |> Js.Array.length == 0
    && !(results |> Js.Array.includes(0.0));
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
      firstRating: firstRating,
      isDummy: isDummyId(playerId),
      id: playerId,
    };
  };

  let matches2ScoreData = (matchList: array(Match.t)) => {
    matchList
    |> Js.Array.reduce(
         (acc, match: Match.t) => {
           let newDataWhite =
             makeScoreData(
               ~existingData=acc,
               ~playerId=match.whiteId,
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
          score: playerStats.results->Utils.listSumF,
        };
        acc->Map.String.set(key, newData);
      },
    );
  };
};