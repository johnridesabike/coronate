type t = {
  id: string,
  avoidIds: array(string),
  colorScores: array(float),
  colors: array(int),
  halfPos: int,
  isUpperHalf: bool,
  opponents: array(string),
  rating: int,
  score: float,
};

[@bs.scope "Math"] [@bs.val] external abs: int => int = "abs";
[@bs.scope "Math"] [@bs.val] external absf: float => float = "abs";

[@bs.module]
external blossom: array((int, int, float)) => array(int) = "edmonds-blossom";

let priority = (value, condition) => condition ? value : 0.0;
let divisiblePriority = (dividend, divisor) => dividend /. divisor;

// The following values probably need to be tweaked a lot.

// The weight given to avoid players meeting twice. This same weight is given to
// avoid matching players on each other's "avoid" list.
// This is the highest priority. (USCF § 27A1)
let avoidMeetingTwice = priority(32.0);

// The weight given to match players with equal scores. This gets divided
// against the difference between each players' scores, plus one. For example,
// players with scores `1` and `3` would have this priority divided by `3`.
// Players with scores `0` and `3` would have this priority divided by `4`.
// Players with equal scores would divide it by `1`, leaving it unchanged.
// (USCF § 27A2)
let sameScores = divisiblePriority(16.0);

// The weight given to match players in lower versus upper halves. This is only
// applied to players being matched within the same score group. (USCF § 27A3)
let halfPosition = divisiblePriority(8.0);
let sameHalfPriority = _ => 0.0;
let differentHalf = isDiffHalf => isDiffHalf ? halfPosition : sameHalfPriority;

// The weight given to match players with opposite due colors.
// (USCF § 27A4 and § 27A5)
let differentDueColor = priority(4.0);

// This is useful for dividing against a calculated priority, to inspect how
// "compatible" two players may be.
let maxPriority =
  Utils.arraySumFloat([|
    differentHalf(true, 1.0),
    differentDueColor(true),
    sameScores(1.0),
    avoidMeetingTwice(true),
  |]);

// Given two `PairingData` objects, this assigns a number for how much they
// should be matched. The number gets fed to the `blossom` algorithm.
let calcPairIdeal = (player1, player2) => {
  player1.id == player2.id
    ? 0.0
    : {
      let metBefore = player1.opponents |> Js.Array.includes(player2.id);
      let mustAvoid = player1.avoidIds |> Js.Array.includes(player2.id);
      let isDiffDueColor = {
        switch (player1.colors |> Js.Array.length) {
        | 0 => true
        | _ =>
          switch (player2.colors |> Js.Array.length) {
          | 0 => true
          | _ => player1.colors->Utils.last !== player2.colors->Utils.last
          }
        };
      };
      let scoreDiff = absf(player1.score -. player2.score) +. 1.0;
      let halfDiff =
        float_of_int(abs(player1.halfPos - player2.halfPos) + 1);
      let isDiffHalf =
        player1.isUpperHalf !== player2.isUpperHalf
        && player1.score === player2.score;
      Utils.arraySumFloat([|
        differentDueColor(isDiffDueColor),
        sameScores(scoreDiff),
        differentHalf(isDiffHalf, halfDiff),
        avoidMeetingTwice(!metBefore && !mustAvoid),
      |]);
    };
};

let descendingScore = Utils.descend(x => x.score);
let descendingRating = Utils.descend(x => x.rating);

// for each object sent to this, it determines whether or not it's in the
// "upper half" of it's score group.
// USCF § 29C1
let setUpperHalves = data => {
  let nextData = Js.Dict.empty();
  let dataList = Js.Dict.values(data);
  dataList
  |> Js.Array.forEach(playerData => {
       let (upperHalfIds, lowerHalfIds) =
         (dataList |> Js.Array.filter(p2 => p2.score == playerData.score))
         ->Belt.SortArray.stableSortBy(descendingRating)
         |> Js.Array.map(p => p.id)
         |> Utils.splitInHalf;
       let isUpperHalf = upperHalfIds |> Js.Array.includes(playerData.id);
       let halfPos =
         isUpperHalf
           ? upperHalfIds |> Js.Array.indexOf(playerData.id)
           : lowerHalfIds |> Js.Array.indexOf(playerData.id);
       // Is there a faster syntax for this?
       let newPlayerData = {...playerData, halfPos, isUpperHalf};
       nextData->Js.Dict.set(playerData.id, newPlayerData);
     });
  nextData;
};

let sortByScoreThenRating =
  Utils.sortWith([|descendingScore, descendingRating|]);

// This this returns a tuple of two objects: The modified array of player data
// without the player assigned a bye, and the player assigned a bye.
// If no player is assigned a bye, the second object is `null`.
// After calling this, be sure to add the bye round after the non-bye'd
// players are paired.
let setByePlayer = (byeQueue, dummyId, data) => {
  let hasNotHadBye = p => !(p.opponents |> Js.Array.includes(dummyId));
  (Js.Dict.keys(data) |> Js.Array.length) mod 2 == 0
    // if the list is even, just return it.
    ? (data, None)
    : {
      let dataList =
        Js.Dict.values(data)
        |> Js.Array.filter(hasNotHadBye)
        |> sortByScoreThenRating;
      let playersWithoutByes = dataList |> Js.Array.map(p => p.id);
      let hasntHadBye = id => playersWithoutByes |> Js.Array.includes(id);
      let nextByeSignups = byeQueue |> Js.Array.filter(hasntHadBye);
      let dataForNextBye = {
        nextByeSignups |> Js.Array.length > 0
          // Assign the bye to the next person who signed up.
          ? {
            switch (data->Js.Dict.get(nextByeSignups[0])) {
            | Some(x) => x
            | None => Utils.last(dataList)
            };
          }
          // Assign a bye to the lowest-rated player in the lowest score group.
          // Because the list is sorted, the last player is the lowest.
          // (USCF § 29L2.)
          : {
            dataList |> Js.Array.length > 0
              ? Utils.last(dataList)
              // In the impossible situation that *everyone* has played a bye round
              // previously, then just pick the last player.
              : Js.Dict.values(data) |> sortByScoreThenRating |> Utils.last;
          };
      };
      // let byeData = Js.Dict.
      let dataWithoutBye =
        Js.Dict.entries(data)
        |> Js.Array.filter(((key, _)) => key !== dataForNextBye.id)
        |> Js.Dict.fromArray;
      (dataWithoutBye, Some(dataForNextBye));
    };
};

let assignColorsForPair = pair => {
  let (player1, player2) = pair;
  // This is a quick-and-dirty heuristic to keep color balances
  // mostly equal. Ideally, it would also examine due colors and how
  // many times a player played each color last.
  Utils.arraySumFloat(player1.colorScores)
  < Utils.arraySumFloat(player2.colorScores)
    // player 1 has played as white more than player 2
    ? (player2.id, player1.id)
    // player 1 has played as black more than player 2
    // (or they're equal).
    : (player1.id, player2.id);
};

let netScore = ((player1, player2)) => player1.score +. player2.score;
let netRating = ((player1, player2)) =>
  float_of_int(player1.rating) +. float_of_int(player2.rating);

let netScoreDescend = (pair1, pair2) => netScore(pair2) -. netScore(pair1);
let netRatingDescend = (pair1, pair2) =>
  netRating(pair2) -. netRating(pair1);
let sortByNetScoreThenRating =
  Utils.sortWithF([|netScoreDescend, netRatingDescend|]);

[@bs.val] external js_infinity: int = "Infinity";

// Create pairings according to the rules specified in USCF § 27, § 28,
//  and § 29. This is a work in progress and does not account for all of the
// rules yet.
let pairPlayers = pairData => {
  // Because `blossom()` has to use numbers that correspond to array indices,
  // we'll use `playerIdArray` as our source for that.
  let playerIdArray = Js.Dict.keys(pairData);
  let playerArray = Js.Dict.values(pairData);
  // Turn the data into blossom-compatible input.
  let pairIdealReducer = (accArr, player1, index) => {
    // slice out players who have already computed, plus the current one
    let playerMatches =
      playerArray
      |> Js.Array.slice(~start=index + 1, ~end_=js_infinity)
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
    // Filter out unmatched players. Blossom will automatically include
    // their missing IDs in its results.
    p1Index == (-1)
      ? acc
      // Translate the indices into ID strings
      : {
        let p1 = pairData->Js.Dict.unsafeGet(playerIdArray[p1Index]);
        let p2 = pairData->Js.Dict.unsafeGet(playerIdArray[p2Index]);

        // TODO: in the future, we may store the ideal for debugging. Because it
        // rarely serves a purpose, we're not including it now.
        // const ideal = potentialMatches.filter(
        //     (pair) => pair[0] === p1Id && pair[1] === p2Id
        // )[0][2];
        // Blossom returns a lot of redundant matches. Check that this matchup
        // wasn't already added.
        let matched = acc |> Js.Array.map(((player, _)) => player);
        !(matched |> Js.Array.includes(p1))
        && !(matched |> Js.Array.includes(p2))
          ? acc |> Js.Array.concat([|(p1, p2)|]) : acc;
      };
  };
  playerArray
  |> Js.Array.reducei(pairIdealReducer, [||])
  // Feed all of the potential matches to Edmonds-blossom and let the
  // algorithm work its magic. This returns an array where each index is the
  // ID of one player and each value is the ID of the matched player.
  |> blossom
  // Translate those IDs into actual pairs of player Ids.
  |> Js.Array.reducei(blossom2Pairs, [||])
  |> sortByNetScoreThenRating
  |> Js.Array.map(assignColorsForPair);
};