open Belt

@ocaml.doc("
 This module is designed to convert types from the `Data` module to types to
 be used in the `Pairing` and `Scoring` modules.
 ")
let makeScoreData = (~player, ~playerId, ~origRating, ~newRating, ~result, ~oppId, ~color) => {
  let player = switch player {
  | None => Data_Scoring.createBlankScoreData(~firstRating=origRating, playerId)
  | Some(data) => data
  }
  {
    ...player,
    results: list{result, ...player.results},
    resultsNoByes: Data_Id.isDummy(oppId)
      ? player.resultsNoByes
      : list{result, ...player.resultsNoByes},
    colors: list{color, ...player.colors},
    colorScores: list{Data_Scoring.Color.toScore(color), ...player.colorScores},
    opponentResults: list{(oppId, result), ...player.opponentResults},
    ratings: list{newRating, ...player.ratings},
    isDummy: Data_Id.isDummy(playerId),
  }
}

let matches2ScoreData = matchList =>
  MutableQueue.reduce(matchList, Map.make(~id=Data_Id.id), (acc, match: Data_Match.t) =>
    switch match.result {
    | NotSet => acc
    | WhiteWon | BlackWon | Draw =>
      let whiteData = makeScoreData(
        ~player=Map.get(acc, match.whiteId),
        ~playerId=match.whiteId,
        ~origRating=match.whiteOrigRating,
        ~newRating=match.whiteNewRating,
        ~result=Data_Match.Result.toScoreWhite(match.result),
        ~oppId=match.blackId,
        ~color=White,
      )
      let blackData = makeScoreData(
        ~player=Map.get(acc, match.blackId),
        ~playerId=match.blackId,
        ~origRating=match.blackOrigRating,
        ~newRating=match.blackNewRating,
        ~result=Data_Match.Result.toScoreBlack(match.result),
        ~oppId=match.whiteId,
        ~color=Black,
      )
      acc->Map.set(match.whiteId, whiteData)->Map.set(match.blackId, blackData)
    }
  )

let tournament2ScoreData = (~roundList, ~scoreAdjustments) =>
  roundList
  ->Data_Rounds.rounds2Matches
  ->matches2ScoreData
  ->Map.map(scoreData =>
    switch Map.get(scoreAdjustments, scoreData.id) {
    | None => scoreData
    | Some(adjustment) => {...scoreData, adjustment: adjustment}
    }
  )

let createPairingData = (scoreData, playerData, avoidPairs) => {
  let avoidMap = Data_Id.Pair.Set.toMap(avoidPairs)
  Map.mapWithKey(playerData, (key, data: Data_Player.t): Data_Pairing.t => {
    let playerStats = switch Map.get(scoreData, key) {
    | None => Data_Scoring.createBlankScoreData(key)
    | Some(x) => x
    }
    let newAvoidIds = switch Map.get(avoidMap, key) {
    | None => Set.make(~id=Data_Id.id)
    | Some(x) => x
    }
    /* `isUpperHalf` and `halfPos` will have to be set by another
     function later. */
    {
      avoidIds: newAvoidIds,
      colorScores: playerStats.colorScores->List.toArray->Array.map(Data_Scoring.Score.toFloat),
      colors: playerStats.colors->List.toArray,
      halfPos: 0,
      id: data.id,
      isUpperHalf: false,
      opponents: playerStats.opponentResults->List.toArray->Array.map(((id, _)) => id),
      rating: data.rating,
      score: Data_Scoring.Score.calcScore(
        playerStats.results,
        ~adjustment=playerStats.adjustment,
      )->Data_Scoring.Score.Sum.toFloat,
    }
  })
}
