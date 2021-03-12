open Belt

@ocaml.doc("
 * This module is designed to convert types from the `Data` module to types to
 * be used in the `Pairing` and `Scoring` modules.
 ")
let makeScoreData = (
  ~existingData,
  ~playerId,
  ~origRating,
  ~newRating,
  ~result,
  ~oppId,
  ~color,
) => {
  open Data_Scoring
  let oldData = switch Map.get(existingData, playerId) {
  | None => createBlankScoreData(~firstRating=origRating, playerId)
  | Some(data) => data
  }

  let newResultsNoByes = {
    Data_Id.isDummy(oppId) ? oldData.resultsNoByes : list{result, ...oldData.resultsNoByes}
  }

  let oldOppResults = oldData.opponentResults

  let oppResult = list{(oppId, result), ...oldOppResults}

  {
    ...oldData,
    results: list{result, ...oldData.results},
    resultsNoByes: newResultsNoByes,
    colors: list{color, ...oldData.colors},
    colorScores: list{Color.toScore(color), ...oldData.colorScores},
    opponentResults: oppResult,
    ratings: list{newRating, ...oldData.ratings},
    isDummy: Data_Id.isDummy(playerId),
  }
}

let matches2ScoreData = matchList =>
  Array.reduce(matchList, Data_Id.Map.make(), (acc, match_) => {
    open Data_Match
    switch match_.result {
    | Data_Match.Result.NotSet => acc
    | Data_Match.Result.WhiteWon
    | Data_Match.Result.BlackWon
    | Data_Match.Result.Draw =>
      let whiteData = makeScoreData(
        ~existingData=acc,
        ~playerId=match_.whiteId,
        ~origRating=match_.whiteOrigRating,
        ~newRating=match_.whiteNewRating,
        ~result=Data_Match.Result.toScoreWhite(match_.result),
        ~oppId=match_.blackId,
        ~color=Data_Scoring.Color.White,
      )
      let blackData = makeScoreData(
        ~existingData=acc,
        ~playerId=match_.blackId,
        ~origRating=match_.blackOrigRating,
        ~newRating=match_.blackNewRating,
        ~result=Data_Match.Result.toScoreBlack(match_.result),
        ~oppId=match_.whiteId,
        ~color=Data_Scoring.Color.Black,
      )
      acc->Map.set(match_.whiteId, whiteData)->Map.set(match_.blackId, blackData)
    }
  })

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
  let avoidMap = Data_Config.Pair.Set.toMap(avoidPairs)
  Map.reduce(playerData, Data_Id.Map.make(), (acc, key, data) => {
    let playerStats = switch Map.get(scoreData, key) {
    | None => Data_Scoring.createBlankScoreData(key)
    | Some(x) => x
    }
    let newAvoidIds = switch Map.get(avoidMap, key) {
    | None => list{}
    | Some(x) => x
    }
    /* `isUpperHalf` and `halfPos` will have to be set by another
     function later. */
    let newData = {
      open Data_Pairing
      {
        avoidIds: newAvoidIds,
        colorScores: playerStats.Data_Scoring.colorScores->List.map(Data_Scoring.Score.toFloat),
        colors: playerStats.colors,
        halfPos: 0,
        id: data.Data_Player.id,
        isUpperHalf: false,
        opponents: playerStats.opponentResults->List.map(((id, _)) => id),
        rating: data.Data_Player.rating,
        score: Data_Scoring.Score.calcScore(
          playerStats.results,
          ~adjustment=playerStats.adjustment,
        )->Data_Scoring.Score.Sum.toFloat,
      }
    }
    Map.set(acc, key, newData)
  })
}
