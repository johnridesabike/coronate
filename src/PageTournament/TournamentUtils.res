/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open Belt
open Data
module Id = Data.Id

type roundData = {
  scoreData: Id.Map.t<Scoring.t>,
  unmatched: Id.Map.t<Data.Player.t>,
  unmatchedWithDummy: Id.Map.t<Data.Player.t>,
}

let useRoundData = (
  roundId,
  {tourney: {roundList, scoreAdjustments, _}, activePlayers, _}: LoadTournament.t,
) => {
  /* Scoring.fromTournament is relatively expensive */
  let scoreData = React.useMemo2(
    () => Scoring.fromTournament(~roundList, ~scoreAdjustments),
    (roundList, scoreAdjustments),
  )
  /* Only calculate unmatched players for the latest round. Old rounds
     don't get to add new players.
     Should this be memoized? */
  let isThisTheLastRound = roundId == Rounds.getLastKey(roundList)
  let unmatched = switch (Rounds.get(roundList, roundId), isThisTheLastRound) {
  | (Some(round), true) =>
    let matched = Rounds.Round.getMatched(round)
    Map.removeMany(activePlayers, matched)
  | _ => Map.make(~id=Id.id)
  }
  /* make a new map so as not to affect auto-pairing */
  let unmatchedWithDummy = Map.set(unmatched, Id.dummy, Player.dummy)
  {
    scoreData: scoreData,
    unmatched: unmatched,
    unmatchedWithDummy: unmatchedWithDummy,
  }
}

type scoreInfo = {
  player: Data.Player.t,
  hasBye: bool,
  colorBalance: string,
  score: float,
  rating: React.element,
  opponentResults: React.element,
  avoidListHtml: React.element,
}

let getScoreInfo = (
  ~player: Data.Player.t,
  ~scoreData,
  ~avoidPairs,
  ~getPlayer,
  ~players,
  ~origRating,
  ~newRating,
) => {
  let {colorScores, opponentResults, results, adjustment, _} = switch Map.get(
    scoreData,
    player.id,
  ) {
  | Some(data) => data
  | None => Data.Scoring.make(player.id)
  }
  let hasBye = List.some(opponentResults, ((id, _)) => Data.Id.isDummy(id))
  let colorBalance = switch Data.Scoring.Score.sum(colorScores)->Data.Scoring.Score.Sum.toFloat {
  | x if x < 0.0 => "White +" ++ x->abs_float->Float.toString
  | x if x > 0.0 => "Black +" ++ x->Float.toString
  | _ => "Even"
  }

  let opponentResults =
    opponentResults
    ->List.toArray
    ->Array.mapWithIndex((i, (opId, result)) =>
      <li key={Data.Id.toString(opId) ++ ("-" ++ Int.toString(i))}>
        {opId->getPlayer->Data.Player.fullName->React.string}
        {" - "->React.string}
        {React.string(
          switch result {
          | Zero
          | NegOne /* Shouldn't be used here */ => "Lost"
          | One => "Won"
          | Half => "Draw"
          },
        )}
      </li>
    )
    ->React.array
  let avoidListHtml =
    Data.Id.Pair.Set.toMap(avoidPairs)
    ->Map.get(player.id)
    ->Option.mapWithDefault([], Set.toArray)
    ->Array.map(pId =>
      switch Map.get(players, pId) {
      /* don't show players not in this tourney */
      | None => React.null
      | Some(p) => <li key={Data.Id.toString(pId)}> {p->Player.fullName->React.string} </li>
      }
    )
    ->React.array
  let rating =
    <>
      {origRating->React.int}
      {switch newRating {
      | None => React.null
      | Some(newRating) =>
        <span>
          {React.string(" (")}
          {Numeral.fromInt(newRating - origRating)->Numeral.format("+0")->React.string}
          {React.string(")")}
        </span>
      }}
    </>
  {
    player: player,
    hasBye: hasBye,
    colorBalance: colorBalance,
    score: Data.Scoring.Score.calcScore(results, ~adjustment)->Data.Scoring.Score.Sum.toFloat,
    rating: rating,
    opponentResults: opponentResults,
    avoidListHtml: avoidListHtml,
  }
}
