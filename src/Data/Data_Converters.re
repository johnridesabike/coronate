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
    | None => Scoring.createBlankScoreData(~firstRating=origRating, playerId)
    | Some(data) => data
    };
  };

  let newResultsNoByes = {
    Scoring.(
      Data_Id.isDummy(oppId)
        ? oldData.resultsNoByes : [result, ...oldData.resultsNoByes]
    );
  };

  let oldOppResults = oldData.Scoring.opponentResults;

  let oppResult = {
    switch (Map.get(oldOppResults, oppId)) {
    | None => result
    | Some(x) => x +. result
    };
  };

  Scoring.{
    ...oldData,
    results: [result, ...oldData.results],
    resultsNoByes: newResultsNoByes,
    colors: [color, ...oldData.colors],
    colorScores: [Scoring.Color.toScore(color), ...oldData.colorScores],
    opponentResults: Map.set(oldOppResults, oppId, oppResult),
    ratings: [newRating, ...oldData.ratings],
    isDummy: Data_Id.isDummy(playerId),
  };
};

let matches2ScoreData = (matchList: array(Data_Match.t)) => {
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
            ~result=
              Data_Match.Result.toFloat(
                match.result,
                Data_Match.Result.White,
              ),
            ~oppId=match.blackId,
            ~color=Scoring.Color.White,
          );
        let blackData =
          makeScoreData(
            ~existingData=acc,
            ~playerId=match.blackId,
            ~origRating=match.blackOrigRating,
            ~newRating=match.blackNewRating,
            ~result=
              Data_Match.Result.toFloat(
                match.result,
                Data_Match.Result.Black,
              ),
            ~oppId=match.whiteId,
            ~color=Scoring.Color.Black,
          );
        acc
        ->Map.set(match.whiteId, whiteData)
        ->Map.set(match.blackId, blackData);
      }
    )
  );
};

let createPairingData = (scoreData, playerData, avoidPairs) => {
  let avoidMap = Data_Config.AvoidPairs.toMap(avoidPairs);
  Map.reduce(
    playerData,
    Data_Id.Map.make(),
    (acc, key, data) => {
      let playerStats = {
        switch (Map.get(scoreData, key)) {
        | None => Scoring.createBlankScoreData(key)
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
        Pairing.{
          avoidIds: newAvoidIds,
          colorScores: playerStats.Scoring.colorScores,
          colors: playerStats.Scoring.colors,
          halfPos: 0,
          id: data.Data_Player.id,
          isUpperHalf: false,
          opponents:
            playerStats.Scoring.opponentResults
            ->Map.keysToArray
            ->List.fromArray,
          rating: data.Data_Player.rating,
          score: Utils.List.sumF(playerStats.Scoring.results),
        };
      Map.set(acc, key, newData);
    },
  );
};
