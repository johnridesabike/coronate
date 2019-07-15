open Belt;

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
  let newRatings = {
    switch (oldData.ratings |> Js.Array.length) {
    | 0 => [|origRating, newRating|]
    | _ => [|newRating|]
    };
  };
  let newResultsNoByes = {
    isDummyId(oppId) ? [||] : [|result|];
  };
  let oldOppResults = oldData.opponentResults;
  let oppResult = {
    switch (oldOppResults->Map.String.get(oppId)) {
    | None => result
    | Some(x) => x +. result
    };
  };
  let newOpponentResults = oldOppResults->Map.String.set(oppId, oppResult);
  Js.Array.(
    Scoring.{
      results: oldData.results |> concat([|result|]),
      resultsNoByes: oldData.resultsNoByes |> concat(newResultsNoByes),
      colors: oldData.colors |> concat([|color|]),
      colorScores: oldData.colorScores |> concat([|colorToScore(color)|]),
      opponentResults: newOpponentResults,
      ratings: oldData.ratings |> concat(newRatings),
      isDummy: isDummyId(playerId),
      id: playerId,
    }
  );
};

let matches2ScoreData = (matchList: array(Data.Match.t)) => {
  matchList
  |> Js.Array.reduce(
       (acc, match: Data.Match.t) => {
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

// Flatten the `[[id1, id2], [id1, id3]]` structure into an easy-to-read
// `{id1: [id2, id3], id2: [id1], id3: [id1]}` structure.
let avoidPairReducer = (acc, pair) => {
  let (id1, id2) = pair;
  let newArr1 = {
    switch (acc->Map.String.get(id1)) {
    | None => [|id2|]
    | Some(currentArr1) => currentArr1 |> Js.Array.concat([|id2|])
    };
  };
  let newArr2 = {
    switch (acc->Map.String.get(id2)) {
    | None => [|id1|]
    | Some(currentArr2) => currentArr2 |> Js.Array.concat([|id1|])
    };
  };
  acc->Map.String.set(id1, newArr1)->Map.String.set(id2, newArr2);
};

let createPairingData = (playerData, avoidPairs, scoreMap) => {
  open Data.Player;
  let avoidMap =
    avoidPairs |> Js.Array.reduce(avoidPairReducer, Map.String.empty);
  Belt.Map.String.valuesToArray(playerData)
  |> Js.Array.reduce(
       (acc, data) => {
         let playerStats = {
           switch (scoreMap->Map.String.get(data.id)) {
           | None => Scoring.createBlankScoreData(data.id)
           | Some(x) => x
           };
         };
         let newAvoidIds = {
           switch (avoidMap->Map.String.get(data.id)) {
           | None => [||]
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
           opponents: playerStats.opponentResults->Map.String.keysToArray,
           rating: data.rating,
           score: playerStats.results->Utils.arraySumFloat,
         };
         acc->Map.String.set(data.id, newData);
       },
       Map.String.empty,
     );
};