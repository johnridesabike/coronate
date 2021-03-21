open Belt
module Id = Data_Id

let sum = list => Array.reduce(list, 0.0, (a, b) => a +. b)

type t = {
  id: Id.t,
  avoidIds: Id.Set.t,
  colorScores: array<float>,
  colors: array<Data_Scoring.Color.t>,
  halfPos: int,
  isUpperHalf: bool,
  opponents: array<Id.t>,
  rating: int,
  score: float,
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

let maxPriority = sum([
  differentHalf(true, 1.0),
  differentDueColor(true),
  sameScores(1.0),
  avoidMeetingTwice(true),
])

let calcPairIdeal = (player1, player2) =>
  if Id.eq(player1.id, player2.id) {
    0.0
  } else {
    let metBefore = Array.some(player1.opponents, Id.eq(player2.id))
    let mustAvoid = Set.has(player1.avoidIds, player2.id)
    let isDiffDueColor = switch (player1.colors[0], player2.colors[0]) {
    | (Some(color1), Some(color2)) => color1 != color2
    | (_, _) => true
    }
    let scoreDiff = abs_float(player1.score -. player2.score) +. 1.0
    let halfDiff = float_of_int(abs(player1.halfPos - player2.halfPos) + 1)
    let isDiffHalf = player1.isUpperHalf != player2.isUpperHalf && player1.score == player2.score
    sum([
      differentDueColor(isDiffDueColor),
      sameScores(scoreDiff),
      differentHalf(isDiffHalf, halfDiff),
      avoidMeetingTwice(!metBefore && !mustAvoid),
    ])
  }

//let descendingScore = Utils.descend(compare, x => x.score);
let descendingRating = Utils.descend(compare, (. x) => x.rating)

let splitInHalf = arr => {
  let midpoint = Js.Array.length(arr) / 2
  (Array.slice(arr, ~offset=0, ~len=midpoint), Array.sliceToEnd(arr, midpoint))
}

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
    let getIndex = Array.getIndexBy(_, x => x === playerData)
    let (halfPos, isUpperHalf) = switch (getIndex(upperHalfIds), getIndex(lowerHalfIds)) {
    | (Some(index), Some(_)) /* This shouldn't happen. */
    | (Some(index), None) => (index, true)
    | (None, Some(index)) => (index, false)
    | (None, None) => (0, false) /* This shouldn't happen. */
    }
    {...playerData, halfPos: halfPos, isUpperHalf: isUpperHalf}
  })
}

let sortByScoreThenRating = (data1, data2) =>
  switch compare(data1.score, data2.score) {
  | 0 => compare(data1.rating, data2.rating)
  | x => x
  }

let setByePlayer = (byeQueue, dummyId, data) => {
  let hasNotHadBye = p => !Array.some(p.opponents, Id.eq(dummyId))
  /* if the list is even, just return it. */
  if mod(Map.size(data), 2) == 0 {
    (data, None)
  } else {
    let dataArr =
      data
      ->Map.valuesToArray
      ->Array.keep(hasNotHadBye)
      ->SortArray.stableSortBy(sortByScoreThenRating)
    let playerIdsWithoutByes = Array.map(dataArr, p => p.id)
    let hasntHadByeFn = id => Array.some(playerIdsWithoutByes, Id.eq(id))
    let nextByeSignups = byeQueue->List.fromArray->List.keep(hasntHadByeFn)
    let dataForNextBye = switch nextByeSignups {
    /* Assign the bye to the next person who signed up. */
    | list{id, ..._} =>
      switch data->Map.get(id) {
      | Some(x) => x
      | None => dataArr->Array.getExn(0)
      }
    | list{} =>
      /* Assign a bye to the lowest-rated player in the lowest score group.
           Because the list is sorted, the last player is the lowest.
           (USCF § 29L2.) */
      switch dataArr[0] {
      | Some(data) => data
      /* In the impossible situation that *everyone* has played a bye
       round previously, then just pick the last player. */
      | None =>
        data->Map.valuesToArray->SortArray.stableSortBy(sortByScoreThenRating)->Array.getExn(0)
      }
    }
    let dataWithoutBye = Map.remove(data, dataForNextBye.id)
    (dataWithoutBye, Some(dataForNextBye))
  }
}

let assignColorsForPair = ((player1, player2)) =>
  /* This is a quick-and-dirty heuristic to keep color balances
     mostly equal. Ideally, it would also examine due colors and how
     many times a player played each color last. */
  sum(player1.colorScores) < sum(player2.colorScores)
  /* player 1 has played as white more than player 2 */
    ? (player2.id, player1.id)
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
  ->Blossom.Match.reduce(~init=Data_Id.Pair.Set.empty, ~f=(acc, p1, p2) =>
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
