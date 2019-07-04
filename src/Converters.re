open Data;
let blackValue = 1.0;
let whiteValue = (-1.0);

let black = 1;
let white = 0;

let colorToScore = color => color == black ? blackValue : whiteValue;

let getOppColor = color => color == white ? black : white;

let dummyId = "________DUMMY________";

let isDummyId = playerId => playerId == dummyId;

let matches2ScoreData = matchList => {
  let scoreDict = Js.Dict.empty();
  // This is awkward.
  let makeScoreData =
      (~playerId, ~origRating, ~newRating, ~result, ~oppId, ~color) => {
    // Get existing score data to update, or create it fresh
    let oldData = {
      switch (scoreDict->Js.Dict.get(playerId)) {
      | None => Scoring.createBlankScoreData(playerId)
      | Some(data) => data
      };
    };
    // The ratings will always begin with the `origRating` of the
    // first match they were in.
    let newRatings = {
      switch (oldData->Scoring.ratingsGet |> Js.Array.length) {
      | 0 => [|origRating, newRating|]
      | _ => [|newRating|]
      };
    };
    let newResultsNoByes = {
      isDummyId(oppId) ? [||] : [|result|];
    };
    let newOpponentResults = oldData->Scoring.opponentResultsGet;
    let oppResult = {
      switch (newOpponentResults->Js.Dict.get(oppId)) {
      | None => result
      | Some(x) => x +. result
      };
    };
    newOpponentResults->Js.Dict.set(oppId, oppResult);
    Scoring.scoreData(
      ~results=oldData->Scoring.resultsGet|>Js.Array.concat([|result|]),
      ~resultsNoByes=
        oldData->Scoring.resultsNoByesGet|>Js.Array.concat(newResultsNoByes),
      ~colors=oldData->Scoring.colorsGet|>Js.Array.concat([|color|]),
      ~colorScores=
        oldData
        ->Scoring.colorScoresGet
        |>Js.Array.concat([|colorToScore(color)|]),
      ~opponentResults=newOpponentResults,
      ~ratings=oldData->Scoring.ratingsGet|>Js.Array.concat(newRatings),
      ~isDummy=isDummyId(playerId),
      ~id=playerId,
    );
  };
  matchList
  |> Js.Array.forEach((match: Data.match) => {
       let playerIds = match.playerIds;
       let result = match.result;
       let newRating = match.newRating;
       let origRating = match.origRating;
       let newDataWhite =
         makeScoreData(
           ~playerId=playerIds.whiteId,
           ~origRating=origRating.whiteRating,
           ~newRating=newRating.whiteRating,
           ~result=result.whiteScore,
           ~oppId=playerIds.blackId,
           ~color=white,
         );
       scoreDict->Js.Dict.set(playerIds.whiteId, newDataWhite);
       let newDataBlack =
         makeScoreData(
           ~playerId=playerIds.blackId,
           ~origRating=origRating.blackRating,
           ~newRating=newRating.blackRating,
           ~result=result.blackScore,
           ~oppId=playerIds.whiteId,
           ~color=black,
         );
       scoreDict->Js.Dict.set(playerIds.blackId, newDataBlack);
     });
  scoreDict;
};

// Flatten the `[[id1, id2], [id1, id3]]` structure into an easy-to-read
// `{id1: [id2, id3], id2: [id1], id3: [id1]}` structure.
let avoidPairReducer = (acc, pair) => {
  let (id1, id2) = pair;
  let currentArr1 = acc->Js.Dict.get(id1);
  let newArr1 = {
    switch (currentArr1) {
    | None => [|id2|]
    | Some(currentArr1) => currentArr1 |> Js.Array.concat([|id2|])
    };
  };
  acc->Js.Dict.set(id1, newArr1);
  let currentArr2 = acc->Js.Dict.get(id2);
  let newArr2 = {
    switch (currentArr2) {
    | None => [|id1|]
    | Some(currentArr2) => currentArr2 |> Js.Array.concat([|id1|])
    };
  };
  acc->Js.Dict.set(id2, newArr2);
  acc;
};

let createPairingData = (playerData, avoidPairs, scoreDict) => {
  let avoidDict =
    avoidPairs |> Js.Array.reduce(avoidPairReducer, Js.Dict.empty());
  let pairData = Js.Dict.empty();
  Js.Dict.values(playerData)
  |> Js.Array.forEach((data: Data.player) => {
       let playerStats = {
         switch (scoreDict->Js.Dict.get(data.id)) {
         | None => Scoring.createBlankScoreData(data.id)
         | Some(x) => x
         };
       };
       let newAvoidIds = {
         switch (avoidDict->Js.Dict.get(data.id)) {
         | None => [||]
         | Some(x) => x
         };
       };
       // `isUpperHalf` and `halfPos` will have to be set by another
       // function later.
       let newData: Pairing.pairingData = {
           avoidIds: newAvoidIds,
           colorScores: playerStats->Scoring.colorScoresGet,
           colors: playerStats->Scoring.colorsGet,
           halfPos: 0,
           id: data.id,
           isUpperHalf: false,
           opponents: playerStats->Scoring.opponentResultsGet->Js.Dict.keys,
           rating: data.rating,
           score: playerStats->Scoring.resultsGet->Utils.arraySumFloat,
        };
       pairData->Js.Dict.set(data.id, newData);
     });
  pairData;
};