open Belt;

type t = {
  id: Data_Id.t,
  avoidIds: list(Data_Id.t),
  colorScores: list(float),
  colors: list(Data_Scoring.Color.t),
  halfPos: int,
  isUpperHalf: bool,
  opponents: list(Data_Id.t),
  rating: int,
  score: float,
};

let priority = (value, condition) => condition ? value : 0.0;
let divisiblePriority = (dividend, divisor) => dividend /. divisor;

/* The following values probably need to be tweaked a lot. */

/**
 * The weight given to avoid players meeting twice. This same weight is given to
 * avoid matching players on each other's "avoid" list.
 * This is the highest priority. (USCF § 27A1)
 */
let avoidMeetingTwice = priority(32.0);

/**
 * The weight given to match players with equal scores. This gets divided
 * against the difference between each players' scores, plus one. For example,
 * players with scores `1` and `3` would have this priority divided by `3`.
 * Players with scores `0` and `3` would have this priority divided by `4`.
 * Players with equal scores would divide it by `1`, leaving it unchanged.
 * (USCF § 27A2)
 */
let sameScores = divisiblePriority(16.0);

/**
 * The weight given to match players in lower versus upper halves. This is only
 * applied to players being matched within the same score group. (USCF § 27A3)
 */
let halfPosition = divisiblePriority(8.0);
let sameHalfPriority = _ => 0.0;
let differentHalf = isDiffHalf => isDiffHalf ? halfPosition : sameHalfPriority;

/**
 * The weight given to match players with opposite due colors.
 * (USCF § 27A4 and § 27A5)
 */
let differentDueColor = priority(4.0);

let maxPriority =
  Utils.List.sumF([
    differentHalf(true, 1.0),
    differentDueColor(true),
    sameScores(1.0),
    avoidMeetingTwice(true),
  ]);

let calcPairIdeal = (player1, player2) =>
  if (player1.id === player2.id) {
    0.0;
  } else {
    let metBefore = List.has(player1.opponents, player2.id, (===));
    let mustAvoid = List.has(player1.avoidIds, player2.id, (===));
    let isDiffDueColor =
      switch (player1.colors, player2.colors) {
      | (_, [])
      | ([], _) => true
      | ([color1, ..._], [color2, ..._]) => color1 !== color2
      };
    let scoreDiff = abs_float(player1.score -. player2.score) +. 1.0;
    let halfDiff = float_of_int(abs(player1.halfPos - player2.halfPos) + 1);
    let isDiffHalf =
      player1.isUpperHalf !== player2.isUpperHalf
      && player1.score === player2.score;
    Utils.List.sumF([
      differentDueColor(isDiffDueColor),
      sameScores(scoreDiff),
      differentHalf(isDiffHalf, halfDiff),
      avoidMeetingTwice(!metBefore && !mustAvoid),
    ]);
  };

//let descendingScore = Utils.descend(compare, x => x.score);
let descendingRating = Utils.descend(compare, x => x.rating);

let splitInHalf = arr => {
  let midpoint = Js.Array.length(arr) / 2;
  (
    Array.slice(arr, ~offset=0, ~len=midpoint),
    Array.sliceToEnd(arr, midpoint),
  );
};

let setUpperHalves = data => {
  let dataList = Map.valuesToArray(data);
  Map.map(
    data,
    playerData => {
      let (upperHalfIds, lowerHalfIds) =
        dataList
        ->Array.keep(({score, _}) => score === playerData.score)
        ->Belt.SortArray.stableSortBy(descendingRating)
        ->splitInHalf;
      /* We need to know what position in each half the player occupies. We're
         uisng array indices to identify these.*/
      let getIndex = Array.getIndexBy(_, x => x === playerData);
      let (halfPos, isUpperHalf) =
        switch (getIndex(upperHalfIds), getIndex(lowerHalfIds)) {
        | (Some(index), Some(_)) /* This shouldn't happen. */
        | (Some(index), None) => (index, true)
        | (None, Some(index)) => (index, false)
        | (None, None) => (0, false) /* This shouldn't happen. */
        };
      {...playerData, halfPos, isUpperHalf};
    },
  );
};

let sortByScoreThenRating = (data1, data2) =>
  switch (compare(data1.score, data2.score)) {
  | 0 => compare(data1.rating, data2.rating)
  | x => x
  };

let setByePlayer = (byeQueue, dummyId, data) => {
  let hasNotHadBye = p => !List.has(p.opponents, dummyId, (===));
  /* if the list is even, just return it. */
  if (Map.size(data) mod 2 === 0) {
    (data, None);
  } else {
    let dataList =
      data
      ->Map.valuesToArray
      ->List.fromArray
      ->List.keep(hasNotHadBye)
      ->List.sort(sortByScoreThenRating);
    let playerIdsWithoutByes = List.map(dataList, p => p.id);
    let hasntHadByeFn = id => List.has(playerIdsWithoutByes, id, (===));
    let nextByeSignups = byeQueue->List.fromArray->List.keep(hasntHadByeFn);
    let dataForNextBye =
      switch (nextByeSignups) {
      /* Assign the bye to the next person who signed up. */
      | [id, ..._] =>
        switch (data->Map.get(id)) {
        | Some(x) => x
        | None => dataList->List.getExn(0)
        }
      | [] =>
        /* Assign a bye to the lowest-rated player in the lowest score group.
           Because the list is sorted, the last player is the lowest.
           (USCF § 29L2.) */
        switch (dataList) {
        | [data, ..._] => data
        /* In the impossible situation that *everyone* has played a bye
           round previously, then just pick the last player. */
        | [] =>
          data
          ->Map.valuesToArray
          ->List.fromArray
          ->List.sort(sortByScoreThenRating)
          ->List.getExn(0)
        }
      };
    let dataWithoutBye = Map.remove(data, dataForNextBye.id);
    (dataWithoutBye, Some(dataForNextBye));
  };
};

let assignColorsForPair = ((player1, player2)) => {
  /* This is a quick-and-dirty heuristic to keep color balances
     mostly equal. Ideally, it would also examine due colors and how
     many times a player played each color last. */
  Utils.List.sumF(player1.colorScores) < Utils.List.sumF(player2.colorScores)
    /* player 1 has played as white more than player 2 */
    ? (player2.id, player1.id)
    /* player 1 has played as black more than player 2
       (or they're equal). */
    : (player1.id, player2.id);
};

let netScore = ((player1, player2)) => player1.score +. player2.score;
let netRating = ((player1, player2)) => player1.rating + player2.rating;

let sortByNetScoreThenRating = (pair1, pair2) =>
  switch (compare(netScore(pair2), netScore(pair1))) {
  | 0 => compare(netRating(pair2), netRating(pair1))
  | x => x
  };

/*
 let pairPlayers_old = pairData => {
   /* Because `blossom()` has to use numbers that correspond to array indices,
      we'll use `playerIdArray` as our source for that. */
   let playerIdArray = Map.String.keysToArray(pairData);
   let playerArray = Map.String.valuesToArray(pairData);
   /* Turn the data into blossom-compatible input. */
   let pairIdealReducer = (accArr, player1, index) => {
     /* slice out players who have already computed, plus the current one */
     let playerMatches =
       Array.sliceToEnd(playerArray, index + 1)
       ->Array.map(player2 =>
           (
             Js.Array2.indexOf(playerIdArray, player1.id),
             Js.Array2.indexOf(playerIdArray, player2.id),
             calcPairIdeal(player1, player2),
           )
         );
     Array.concat(accArr, playerMatches);
   };
   let blossom2Pairs = (acc, p1Index, p2Index) => {
     /* Translate the indices into ID strings */
     let p1Id = playerIdArray[p1Index];
     let p2Id = playerIdArray[p2Index];
     switch (p1Id, p2Id) {
     /* Filter out unmatched players. Blossom will automatically include
        their missing IDs in its results. */
     | (None, _)
     | (_, None) => acc
     | (Some(p1Id), Some(p2Id)) =>
       let p1 = Map.String.getExn(pairData, p1Id);
       let p2 = Map.String.getExn(pairData, p2Id);
       /* In the future, we may store the ideal for debugging. Because it
          rarely serves a purpose, we're not including it now.
          const ideal = potentialMatches.filter(
              (pair) => pair[0] === p1Id && pair[1] === p2Id
          )[0][2];
          Blossom returns a lot of redundant matches. Check that this matchup
          wasn't already added. */
       let matched = List.map(acc, ((player, _)) => player);
       let matchedHasId = List.has(matched, _, (===));
       if (!matchedHasId(p1) && !matchedHasId(p2)) {
         [(p1, p2), ...acc];
       } else {
         acc;
       };
     };
   };
   playerArray
   ->Array.reduceWithIndex([||], pairIdealReducer)
   /* Feed all of the potential matches to Edmonds-blossom and let the
      algorithm work its magic. This returns an array where each index is the
      ID of one player and each value is the ID of the matched player. */
   ->Externals.blossom
   /* Translate those IDs into actual pairs of player Ids. */
   ->Array.reduceWithIndex([], blossom2Pairs)
   ->List.sort(sortByNetScoreThenRating)
   ->List.map(assignColorsForPair);
 };
 */

let pairEq = ((a, b), (c, d)) => a === c && b === d || b === c && a === d;

let pairPlayers = pairData => {
  /* This is not optimized for performance, but in practice that hasn't been a
     problem yet. */
  Map.reduce(pairData, [], (acc, p1Id, p1) => {
    Map.reduce(pairData, acc, (acc2, p2Id, p2) =>
      [
        (
          Data_Id.toString(p1Id),
          Data_Id.toString(p2Id),
          calcPairIdeal(p1, p2),
        ),
        ...acc2,
      ]
    )
  })
  /* Feed all of the potential matches to the Blossom algorithim and let the
     algorithm work its magic. */
  ->Blossom.Match.String.make
  /* Blossom returns redundant pair data. This filters them out. */
  ->Blossom.Match.reduce(~init=[], ~f=(acc, p1, p2) =>
      List.has(acc, (p1, p2), pairEq) ? acc : [(p1, p2), ...acc]
    )
  /* Convert the ids back to their pairing data */
  ->List.keepMap(((p1, p2)) => {
      let p1 = Data_Id.fromString(p1);
      let p2 = Data_Id.fromString(p2);
      switch (Map.(get(pairData, p1), get(pairData, p2))) {
      | (Some(p1), Some(p2)) => Some((p1, p2))
      | _ => None
      };
    })
  ->List.sort(sortByNetScoreThenRating)
  /* assign colors and also convert them back to their id strings */
  ->List.map(assignColorsForPair);
};
