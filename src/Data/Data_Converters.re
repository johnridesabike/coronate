open Belt;

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
    Data_Player.isDummyId(oppId)
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
    isDummy: Data_Player.isDummyId(playerId),
    id: playerId,
  };
};

let matches2ScoreData = matchList => {
  matchList
  |> Js.Array.reduce(
       (acc, match) =>
         Data_Match.(
           switch (match.result) {
           | NotSet => acc
           | WhiteWon
           | BlackWon
           | Draw =>
             let whiteData =
               makeScoreData(
                 ~existingData=acc,
                 ~playerId=match.whiteId,
                 ~origRating=match.whiteOrigRating,
                 ~newRating=match.whiteNewRating,
                 ~result=match.result->Data_Match.Result.(toFloat(White)),
                 ~oppId=match.blackId,
                 ~color=Scoring.Color.White,
               );
             let blackData =
               makeScoreData(
                 ~existingData=acc,
                 ~playerId=match.blackId,
                 ~origRating=match.blackOrigRating,
                 ~newRating=match.blackNewRating,
                 ~result=match.result->Data_Match.Result.(toFloat(Black)),
                 ~oppId=match.whiteId,
                 ~color=Scoring.Color.Black,
               );
             Map.String.(
               acc
               ->set(match.whiteId, whiteData)
               ->set(match.blackId, blackData)
             );
           }
         ),
       Map.String.empty,
     );
};

let createPairingData = (playerData, avoidPairs, scoreMap) => {
  let avoidMap =
    avoidPairs->Set.reduce(
      Map.String.empty,
      Data_Config.AvoidPairs.reduceToMap,
    );
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
          id: data.Data_Player.id,
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