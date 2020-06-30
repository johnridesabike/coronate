open Belt;

/**
 * This module is designed to convert types from the `Data` module to types to
 * be used in the `Pairing` and `Scoring` modules.
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
    switch (Map.get(existingData, playerId)) {
    | None =>
      Data_Scoring.createBlankScoreData(~firstRating=origRating, playerId)
    | Some(data) => data
    };
  };

  let newResultsNoByes = {
    Data_Scoring.(
      Data_Id.isDummy(oppId)
        ? oldData.resultsNoByes : [result, ...oldData.resultsNoByes]
    );
  };

  let oldOppResults = oldData.Data_Scoring.opponentResults;

  /*
   let oppResult = {
     switch (Map.get(oldOppResults, oppId)) {
     | None => Data_Scoring.Score.toSum(result)
     | Some(x) => Data_Scoring.Score.add(x, result)
     };
   };
   */

  let oppResult = [(oppId, result), ...oldOppResults];

  Data_Scoring.{
    ...oldData,
    results: [result, ...oldData.results],
    resultsNoByes: newResultsNoByes,
    colors: [color, ...oldData.colors],
    colorScores: [Data_Scoring.Color.toScore(color), ...oldData.colorScores],
    opponentResults: oppResult, //Map.set(oldOppResults, oppId, oppResult),
    ratings: [newRating, ...oldData.ratings],
    isDummy: Data_Id.isDummy(playerId),
  };
};

let matches2ScoreData = matchList =>
  Array.reduce(matchList, Data_Id.Map.make(), (acc, match) =>
    Data_Match.(
      switch (match.result) {
      | Data_Match.Result.NotSet => acc
      | Data_Match.Result.WhiteWon
      | Data_Match.Result.BlackWon
      | Data_Match.Result.Draw =>
        let whiteData =
          makeScoreData(
            ~existingData=acc,
            ~playerId=match.whiteId,
            ~origRating=match.whiteOrigRating,
            ~newRating=match.whiteNewRating,
            ~result=Data_Match.Result.toScoreWhite(match.result),
            ~oppId=match.blackId,
            ~color=Data_Scoring.Color.White,
          );
        let blackData =
          makeScoreData(
            ~existingData=acc,
            ~playerId=match.blackId,
            ~origRating=match.blackOrigRating,
            ~newRating=match.blackNewRating,
            ~result=Data_Match.Result.toScoreBlack(match.result),
            ~oppId=match.whiteId,
            ~color=Data_Scoring.Color.Black,
          );
        acc
        ->Map.set(match.whiteId, whiteData)
        ->Map.set(match.blackId, blackData);
      }
    )
  );

let tournament2ScoreData = (~roundList, ~scoreAdjustments) =>
  roundList
  ->Data_Rounds.rounds2Matches
  ->matches2ScoreData
  ->Map.map(scoreData =>
      switch (Map.get(scoreAdjustments, scoreData.id)) {
      | None => scoreData
      | Some(adjustment) => {...scoreData, adjustment}
      }
    );

let createPairingData = (scoreData, playerData, avoidPairs) => {
  let avoidMap = Data_Config.Pair.Set.toMap(avoidPairs);
  Map.reduce(
    playerData,
    Data_Id.Map.make(),
    (acc, key, data) => {
      let playerStats = {
        switch (Map.get(scoreData, key)) {
        | None => Data_Scoring.createBlankScoreData(key)
        | Some(x) => x
        };
      };
      let newAvoidIds = {
        switch (Map.get(avoidMap, key)) {
        | None => []
        | Some(x) => x
        };
      };
      /* `isUpperHalf` and `halfPos` will have to be set by another
         function later. */
      let newData =
        Data_Pairing.{
          avoidIds: newAvoidIds,
          colorScores:
            playerStats.Data_Scoring.colorScores
            ->List.map(Data_Scoring.Score.toFloat),
          colors: playerStats.colors,
          halfPos: 0,
          id: data.Data_Player.id,
          isUpperHalf: false,
          opponents:
            playerStats.opponentResults
            ->List.map(((id, _)) => id),
          rating: data.Data_Player.rating,
          score:
            Data_Scoring.Score.calcScore(
              playerStats.results,
              ~adjustment=playerStats.adjustment,
            )
            ->Data_Scoring.Score.Sum.toFloat,
        };
      Map.set(acc, key, newData);
    },
  );
};
