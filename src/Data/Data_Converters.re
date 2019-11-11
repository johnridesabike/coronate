open Belt;
/* This module is designed to convert types from the `Data` module to types to
   be used in the `Pairing` and `Scoring` modules.*/
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
    switch (Map.String.get(existingData, playerId)) {
    | None => Scoring.createBlankScoreData(~firstRating=origRating, playerId)
    | Some(data) => data
    };
  };
  let newResultsNoByes = {
    Data_Player.isDummyId(oppId)
      ? oldData.resultsNoByes : [result, ...oldData.resultsNoByes];
  };
  let oldOppResults = oldData.opponentResults;
  let oppResult = {
    switch (Map.String.get(oldOppResults, oppId)) {
    | None => result
    | Some(x) => x +. result
    };
  };
  {
    ...oldData,
    results: [result, ...oldData.results],
    resultsNoByes: newResultsNoByes,
    colors: [color, ...oldData.colors],
    colorScores: [Scoring.Color.toScore(color), ...oldData.colorScores],
    opponentResults: Map.String.set(oldOppResults, oppId, oppResult),
    ratings: [newRating, ...oldData.ratings],
    isDummy: Data_Player.isDummyId(playerId),
  };
};

let matches2ScoreData = (matchList: array(Data_Match.t)) => {
  Array.reduce(matchList, Map.String.empty, (acc, match) =>
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
            ~result=Data_Match.Result.toFloat(match.result, White),
            ~oppId=match.blackId,
            ~color=Scoring.Color.White,
          );
        let blackData =
          makeScoreData(
            ~existingData=acc,
            ~playerId=match.blackId,
            ~origRating=match.blackOrigRating,
            ~newRating=match.blackNewRating,
            ~result=Data_Match.Result.toFloat(match.result, Black),
            ~oppId=match.whiteId,
            ~color=Scoring.Color.Black,
          );
        acc
        ->Map.String.set(match.whiteId, whiteData)
        ->Map.String.set(match.blackId, blackData);
      }
    )
  );
};

let createPairingData = (scoreData, playerData, avoidPairs) => {
  let avoidMap = Data_Config.AvoidPairs.toMap(avoidPairs);
  Map.String.reduce(
    playerData,
    Map.String.empty,
    (acc, key, data) => {
      let playerStats = {
        switch (Map.String.get(scoreData, key)) {
        | None => Scoring.createBlankScoreData(key)
        | Some(x) => x
        };
      };
      let newAvoidIds = {
        switch (Map.String.get(avoidMap, key)) {
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
          score: Utils.List.sumF(playerStats.results),
        };
      Map.String.set(acc, key, newData);
    },
  );
};