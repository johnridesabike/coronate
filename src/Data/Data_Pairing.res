/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open Belt
module Id = Data_Id

@deriving(accessors)
type t = {
  id: Id.t,
  avoidIds: Id.Set.t,
  colorScore: float,
  lastColor: option<Data_Scoring.Color.t>,
  halfPos: int,
  isUpperHalf: bool,
  opponents: list<Id.t>,
  rating: int,
  score: float,
}

//let descendingScore = Utils.descend(compare, x => x.score);
let descendingRating = Utils.descend(compare, (. x) => x.rating)

let splitInHalf = arr => {
  let midpoint = try {
    Array.size(arr) / 2
  } catch {
  | Division_by_zero => 0
  }
  (Array.slice(arr, ~offset=0, ~len=midpoint), Array.sliceToEnd(arr, midpoint))
}

@ocaml.doc("
 This determines what \"half\" each player is in: upper half or lower half.
 It also determines their \"position\" within each half.
 USCF § 29C1
 ")
let setUpperHalves = data => {
  let dataArr = Map.valuesToArray(data)
  Map.map(data, playerData => {
    let (upperHalfIds, lowerHalfIds) =
      dataArr
      ->Array.keep(({score, _}) => score == playerData.score)
      ->Belt.SortArray.stableSortBy(descendingRating)
      ->splitInHalf
    /* We need to know what position in each half the player occupies. We're
     uisng array indices to identify these. */
    let getIndex = Array.getIndexBy(_, x => Data_Id.eq(x.id, playerData.id))
    let (halfPos, isUpperHalf) = switch (getIndex(upperHalfIds), getIndex(lowerHalfIds)) {
    | (Some(index), Some(_)) /* This shouldn't happen. */
    | (Some(index), None) => (index, true)
    | (None, Some(index)) => (index, false)
    | (None, None) => (0, false) /* This shouldn't happen. */
    }
    {...playerData, halfPos: halfPos, isUpperHalf: isUpperHalf}
  })
}

let make = (scoreData, playerData, avoidPairs) => {
  let avoidMap = Data_Id.Pair.Set.toMap(avoidPairs)
  Map.mapWithKey(playerData, (key, data: Data_Player.t) => {
    let playerStats = switch Map.get(scoreData, key) {
    | None => Data_Scoring.make(key)
    | Some(x) => x
    }
    let newAvoidIds = switch Map.get(avoidMap, key) {
    | None => Set.make(~id=Data_Id.id)
    | Some(x) => x
    }
    {
      avoidIds: newAvoidIds,
      colorScore: playerStats.colorScores->Data_Scoring.Score.sum->Data_Scoring.Score.Sum.toFloat,
      lastColor: playerStats.lastColor,
      halfPos: 0, // temporary
      id: data.id,
      isUpperHalf: false, // temporary
      opponents: playerStats.opponentResults->List.map(((id, _)) => id),
      rating: data.rating,
      score: playerStats.results
      ->Data_Scoring.Score.calcScore(~adjustment=playerStats.adjustment)
      ->Data_Scoring.Score.Sum.toFloat,
    }
  })->setUpperHalves
}

let priority = (value, condition) => condition ? value : 0.0
let divisiblePriority = (dividend, divisor) => dividend /. divisor

/* The following values probably need to be tweaked a lot. */

@ocaml.doc("
 The weight given to avoid players meeting twice. This same weight is given to
 avoid matching players on each other's \"avoid\" list.
 This is the highest priority. (USCF § 27A1)
 ")
let avoidMeetingTwice = priority(32.0)

@ocaml.doc("
 The weight given to match players with equal scores. This gets divided
 against the difference between each players' scores, plus one. For example,
 players with scores `1` and `3` would have this priority divided by `3`.
 Players with scores `0` and `3` would have this priority divided by `4`.
 Players with equal scores would divide it by `1`, leaving it unchanged.
 (USCF § 27A2)
 ")
let sameScores = divisiblePriority(16.0)

@ocaml.doc("
 The weight given to match players in lower versus upper halves. This is only
 applied to players being matched within the same score group. (USCF § 27A3)
 ")
let halfPosition = divisiblePriority(8.0)
let sameHalfPriority = _ => 0.0
let differentHalf = isDiffHalf => isDiffHalf ? halfPosition : sameHalfPriority

@ocaml.doc("
 The weight given to match players with opposite due colors.
 (USCF § 27A4 and § 27A5)
 ")
let differentDueColor = priority(4.0)

let maxPriority =
  differentHalf(true, 1.0) +. differentDueColor(true) +. sameScores(1.0) +. avoidMeetingTwice(true)

let calcPairIdeal = (player1, player2) =>
  if Id.eq(player1.id, player2.id) {
    0.0
  } else {
    let metBefore = List.some(player1.opponents, Id.eq(player2.id))
    let mustAvoid = Set.has(player1.avoidIds, player2.id)
    let isDiffDueColor = switch (player1.lastColor, player2.lastColor) {
    | (Some(color1), Some(color2)) => color1 != color2
    | (_, _) => true
    }
    let scoreDiff = abs_float(player1.score -. player2.score) +. 1.0
    let halfDiff = Float.fromInt(abs(player1.halfPos - player2.halfPos) + 1)
    let isDiffHalf = player1.isUpperHalf != player2.isUpperHalf && player1.score == player2.score
    differentDueColor(isDiffDueColor) +.
    sameScores(scoreDiff) +.
    differentHalf(isDiffHalf, halfDiff) +.
    avoidMeetingTwice(!metBefore && !mustAvoid)
  }

let sortByScoreThenRating = (data1, data2) =>
  switch compare(data1.score, data2.score) {
  | 0 => compare(data1.rating, data2.rating)
  | x => x
  }

let setByePlayer = (byeQueue, dummyId, data) => {
  let hasNotHadBye = p => !List.some(p.opponents, Id.eq(dummyId))
  /* if the list is even, just return it. */
  switch mod(Map.size(data), 2) {
  | 0 => (data, None)
  | exception Division_by_zero => (data, None)
  | _ =>
    let dataArr =
      data
      ->Map.valuesToArray
      ->Array.keep(hasNotHadBye)
      ->SortArray.stableSortBy(sortByScoreThenRating)
    let playerIdsWithoutByes = Array.map(dataArr, p => p.id)
    let hasntHadByeFn = id => Array.some(playerIdsWithoutByes, Id.eq(id))
    let nextByeSignups = Array.keep(byeQueue, hasntHadByeFn)
    let dataForNextBye = switch nextByeSignups[0] {
    /* Assign the bye to the next person who signed up. */
    | Some(id) =>
      switch Map.get(data, id) {
      | Some(_) as x => x
      | None => dataArr[0]
      }
    | None =>
      /* Assign a bye to the lowest-rated player in the lowest score group.
         Because the list is sorted, the last player is the lowest.
         (USCF § 29L2.) */
      switch dataArr[0] {
      | Some(_) as x => x
      /* In the impossible situation that *everyone* has played a bye
       round previously, then just pick the last player. */
      | None => data->Map.valuesToArray->SortArray.stableSortBy(sortByScoreThenRating)->Array.get(0)
      }
    }
    let dataWithoutBye = switch dataForNextBye {
    | Some(dataForNextBye) => Map.remove(data, dataForNextBye.id)
    | None => data
    }
    (dataWithoutBye, dataForNextBye)
  }
}

let assignColorsForPair = ((player1, player2)) =>
  /* This is a quick-and-dirty heuristic to keep color balances
     mostly equal. Ideally, it would also examine due colors and how
     many times a player played each color last. */
  player1.colorScore < player2.colorScore
    ? /* player 1 has played as white more than player 2 */
      (player2.id, player1.id)
      /* player 1 has played as black more than player 2
       (or they're equal). */
    : (player1.id, player2.id)

let netScore = ((player1, player2)) => player1.score +. player2.score
let netRating = ((player1, player2)) => player1.rating + player2.rating

let sortByNetScoreThenRating = (pair1, pair2) =>
  switch compare(netScore(pair2), netScore(pair1)) {
  | 0 => compare(netRating(pair2), netRating(pair1))
  | x => x
  }

module IdMatch = unpack(Blossom.Match.comparable(Id.compare))

/* This is not optimized for performance, but in practice that hasn't been a
 problem yet. */
let pairPlayers = pairData => {
  Map.reduce(pairData, list{}, (acc, p1Id, p1) =>
    Map.reduce(pairData, acc, (acc2, p2Id, p2) => list{
      (p1Id, p2Id, calcPairIdeal(p1, p2)),
      ...acc2,
    })
  )
  /* Feed all of the potential matches to the Blossom algorithim and let the
   algorithm work its magic. */
  ->Blossom.Match.make(~id=module(IdMatch))
  /* Blossom returns redundant pair data. This filters them out. */
  ->Blossom.Match.reduce(~init=Set.make(~id=Data_Id.Pair.id), ~f=(acc, p1, p2) =>
    switch Data_Id.Pair.make(p1, p2) {
    | None => acc
    | Some(pair) => Set.add(acc, pair)
    }
  )
  /* Convert the ids back to their pairing data */
  ->Set.toArray
  ->Array.keepMap(pair => {
    let (p1, p2) = Data_Id.Pair.toTuple(pair)
    switch (Map.get(pairData, p1), Map.get(pairData, p2)) {
    | (Some(p1), Some(p2)) => Some((p1, p2))
    | _ => None
    }
  })
  ->SortArray.stableSortBy(sortByNetScoreThenRating)
  ->Array.map(assignColorsForPair)
}
