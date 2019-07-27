/*
   This handles all of the logic for calculating pairings. It requires data
   taken from past tournament scores and player ratings.
 */
open Belt;
type t = {
  id: string,
  avoidIds: list(string),
  colorScores: list(float),
  colors: list(Scoring.Color.t),
  halfPos: int,
  isUpperHalf: bool,
  opponents: list(string),
  rating: int,
  score: float,
};

let priority = (value, condition) => condition ? value : 0.0;
let divisiblePriority = (dividend, divisor) => dividend /. divisor;

/* The following values probably need to be tweaked a lot. */

/* The weight given to avoid players meeting twice. This same weight is given to
   avoid matching players on each other's "avoid" list.
   This is the highest priority. (USCF § 27A1) */
let avoidMeetingTwice = priority(32.0);

/* The weight given to match players with equal scores. This gets divided
   against the difference between each players' scores, plus one. For example,
   players with scores `1` and `3` would have this priority divided by `3`.
   Players with scores `0` and `3` would have this priority divided by `4`.
   Players with equal scores would divide it by `1`, leaving it unchanged.
   (USCF § 27A2) */
let sameScores = divisiblePriority(16.0);

/* The weight given to match players in lower versus upper halves. This is only
   applied to players being matched within the same score group. (USCF § 27A3) */
let halfPosition = divisiblePriority(8.0);
let sameHalfPriority = _ => 0.0;
let differentHalf = isDiffHalf => isDiffHalf ? halfPosition : sameHalfPriority;

/* The weight given to match players with opposite due colors.
   (USCF § 27A4 and § 27A5) */
let differentDueColor = priority(4.0);

/* This is useful for dividing against a calculated priority, to inspect how
   "compatible" two players may be. */
let maxPriority =
  Utils.Array.sumF([|
    differentHalf(true, 1.0),
    differentDueColor(true),
    sameScores(1.0),
    avoidMeetingTwice(true),
  |]);

/* Given two `PairingData` objects, this assigns a number for how much they
   should be matched. The number gets fed to the `blossom` algorithm. */
let calcPairIdeal = (player1, player2) =>
  if (player1.id === player2.id) {
    0.0;
  } else {
    let metBefore = player1.opponents->List.has(player2.id, (===));
    let mustAvoid = player1.avoidIds->List.has(player2.id, (===));
    let isDiffDueColor =
      switch (player1.colors) {
      | [] => true
      | [lastColor1, ..._] =>
        switch (player2.colors) {
        | [] => true
        | [lastColor2, ..._] => lastColor1 !== lastColor2
        }
      };
    let scoreDiff = abs_float(player1.score -. player2.score) +. 1.0;
    let halfDiff = float_of_int(abs(player1.halfPos - player2.halfPos) + 1);
    let isDiffHalf =
      player1.isUpperHalf !== player2.isUpperHalf
      && player1.score === player2.score;
    Utils.Array.sumF([|
      differentDueColor(isDiffDueColor),
      sameScores(scoreDiff),
      differentHalf(isDiffHalf, halfDiff),
      avoidMeetingTwice(!metBefore && !mustAvoid),
    |]);
  };

let descendingScore = Utils.descend(x => x.score);
let descendingRating = Utils.descend(x => x.rating);

let splitInHalf = arr => {
  let midpoint = Js.Array.length(arr) / 2;
  (
    arr->Array.slice(~offset=0, ~len=midpoint),
    arr->Array.sliceToEnd(midpoint),
  );
};

/* for each object sent to this, it determines whether or not it's in the
   "upper half" of it's score group.
   USCF § 29C1 */
let setUpperHalves = data => {
  let dataList = data->Map.String.valuesToArray;
  dataList->Array.reduce(
    Map.String.empty,
    (acc, playerData) => {
      let (upperHalfIds, lowerHalfIds) =
        (dataList |> Js.Array.filter(p2 => p2.score === playerData.score))
        ->SortArray.stableSortBy(descendingRating)
        |> Js.Array.map(p => p.id)
        |> splitInHalf;
      let isUpperHalf = upperHalfIds |> Js.Array.includes(playerData.id);
      let halfPos =
        isUpperHalf
          ? upperHalfIds |> Js.Array.indexOf(playerData.id)
          : lowerHalfIds |> Js.Array.indexOf(playerData.id);
      let newPlayerData = {...playerData, halfPos, isUpperHalf};
      acc->Map.String.set(playerData.id, newPlayerData);
    },
  );
};

let sortByScoreThenRating = (data1, data2) =>
  switch (compare(data1.score, data2.score)) {
  | 0 => compare(data1.rating, data2.rating)
  | x => x
  };

/* This this returns a tuple of two objects: The modified array of player data
   without the player assigned a bye, and the player assigned a bye.
   If no player is assigned a bye, the second object is `null`.
   After calling this, be sure to add the bye round after the non-bye'd
   players are paired. */
let setByePlayer = (byeQueue, dummyId, data) => {
  let hasNotHadBye = p => !p.opponents->List.has(dummyId, (===));
  data->Map.String.keysToArray->Js.Array.length mod 2 === 0
    /* if the list is even, just return it. */
    ? (data, None)
    : {
      let dataList =
        data
        ->Map.String.valuesToArray
        ->List.fromArray
        ->List.keep(hasNotHadBye)
        ->List.sort(sortByScoreThenRating);
      let playerIdsWithoutByes = dataList->List.map(p => p.id);
      let hasntHadByeFn = id => playerIdsWithoutByes->List.has(id, (===));
      let nextByeSignups = byeQueue->List.fromArray->List.keep(hasntHadByeFn);
      let dataForNextBye =
        switch (nextByeSignups) {
        /* Assign the bye to the next person who signed up. */
        | [id, ..._] =>
          switch (data->Map.String.get(id)) {
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
            ->Map.String.valuesToArray
            ->List.fromArray
            ->List.sort(sortByScoreThenRating)
            ->List.getExn(0)
          }
        };
      let dataWithoutBye = data->Map.String.remove(dataForNextBye.id);
      (dataWithoutBye, Some(dataForNextBye));
    };
};

let assignColorsForPair = pair => {
  let (player1, player2) = pair;
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
let netRating = ((player1, player2)) =>
  float_of_int(player1.rating) +. float_of_int(player2.rating);

let sortByNetScoreThenRating = (pair1, pair2) =>
  switch (compare(netScore(pair2), netScore(pair1))) {
  | 0 => compare(netRating(pair2), netRating(pair1))
  | x => x
  };

/* Create pairings according to the rules specified in USCF § 27, § 28,
    and § 29. This is a work in progress and does not account for all of the
   rules yet. */
let pairPlayers = pairData => {
  /* Because `blossom()` has to use numbers that correspond to array indices,
     we'll use `playerIdArray` as our source for that. */
  let playerIdArray = pairData->Map.String.keysToArray;
  let playerArray = pairData->Map.String.valuesToArray;
  /* Turn the data into blossom-compatible input. */
  let pairIdealReducer = (accArr, player1, index) => {
    /* slice out players who have already computed, plus the current one */
    let playerMatches =
      playerArray->Array.sliceToEnd(index + 1)
      |> Js.Array.map(player2 =>
           (
             playerIdArray |> Js.Array.indexOf(player1.id),
             playerIdArray |> Js.Array.indexOf(player2.id),
             calcPairIdeal(player1, player2),
           )
         );
    accArr |> Js.Array.concat(playerMatches);
  };
  let blossom2Pairs = (acc, p1Index, p2Index) => {
    /* Filter out unmatched players. Blossom will automatically include
       their missing IDs in its results. */
    p1Index === (-1)
      ? acc
      /* Translate the indices into ID strings */
      : {
        let p1 =
          pairData->Map.String.getExn(playerIdArray->Array.getExn(p1Index));
        let p2 =
          pairData->Map.String.getExn(playerIdArray->Array.getExn(p2Index));

        /* TODO: in the future, we may store the ideal for debugging. Because it
           rarely serves a purpose, we're not including it now.
           const ideal = potentialMatches.filter(
               (pair) => pair[0] === p1Id && pair[1] === p2Id
           )[0][2];
           Blossom returns a lot of redundant matches. Check that this matchup
           wasn't already added. */
        let matched = acc |> Js.Array.map(((player, _)) => player);
        !(matched |> Js.Array.includes(p1))
        && !(matched |> Js.Array.includes(p2))
          ? acc |> Js.Array.concat([|(p1, p2)|]) : acc;
      };
  };
  playerArray
  |> Js.Array.reducei(pairIdealReducer, [||])
  /* Feed all of the potential matches to Edmonds-blossom and let the
     algorithm work its magic. This returns an array where each index is the
     ID of one player and each value is the ID of the matched player. */
  |> Externals.blossom
  /* Translate those IDs into actual pairs of player Ids. */
  |> Js.Array.reducei(blossom2Pairs, [||])
  |> Js.Array.sortInPlaceWith(sortByNetScoreThenRating)
  |> Js.Array.map(assignColorsForPair);
};