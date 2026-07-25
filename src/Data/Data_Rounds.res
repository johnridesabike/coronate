/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*
  The round structure is currently just nested arrays. Because arrays are
  awkward to manipulate, the functions are consolidated here. In the future,
  I may replace the arrays with a different data type, so hopefully it will be
  simple to rewrite this module if necessary (versus rewriting every
  component).
 */

module Match = Data_Match
module Id = Data_Id

module Round = {
  type t = array<Match.t>

  let fromArray = x => x

  let toArray = x => x

  let empty: t = []

  let encode = t => t->Array.map(Match.encode)->JSON.Encode.array

  @raises(Not_found)
  let decode = json => JSON.Decode.array(json)->Option.getOrThrow->Array.map(Match.decode)

  let size = arr => Array.length(arr)

  let addMatches = (arr1, arr2) => Array.concat(arr1, arr2)

  /* flatten all of the ids from the matches to one array. */
  let getMatched = (round: t) => {
    let q = Belt.MutableQueue.make()
    Array.forEach(round, ({whiteId, blackId, _}) => {
      Belt.MutableQueue.add(q, whiteId)
      Belt.MutableQueue.add(q, blackId)
    })
    Belt.MutableQueue.toArray(q)
  }

  let getMatchById = (round: t, id) => Array.find(round, x => Id.eq(x.id, id))

  let removeMatchById = (round: t, id) => Array.filter(round, x => !Id.eq(x.id, id))

  let setMatch = (round: t, match: Data_Match.t) => {
    let round = Array.copy(round)
    round
    ->Array.findIndexOpt(({Match.id: id, _}) => Id.eq(id, match.id))
    ->Option.map(x => Belt.Array.set(round, x, match))
    ->Option.flatMap(wasSuccessful => wasSuccessful ? Some(round) : None)
  }

  let moveMatch = (round, matchId, direction) =>
    switch getMatchById(round, matchId) {
    | None => None
    | Some(match_) =>
      let oldIndex = Js.Array.indexOf(match_, round)
      let newIndex = oldIndex + direction >= 0 ? oldIndex + direction : 0
      Some(Utils.Array.swap(round, oldIndex, newIndex))
    }
}

type t = array<Round.t>

let fromArray = x => x

let toArray = x => x

let empty: t = [[]]

let encode = t => t->Array.map(Round.encode)->JSON.Encode.array

@raises(Not_found)
let decode = json => JSON.Decode.array(json)->Option.getOrThrow->Array.map(Round.decode)

let size = arr => Array.length(arr)

let getLastKey = rounds => Array.length(rounds) - 1

let get = (arr, i) => arr[i]

let set = (rounds, key, round) => {
  let rounds = Array.copy(rounds)
  let wasSuccessful = Belt.Array.set(rounds, key, round)
  wasSuccessful ? Some(rounds) : None
}

let setMatch = (rounds, key, match_) =>
  rounds->get(key)->Option.flatMap(Round.setMatch(_, match_))->Option.flatMap(set(rounds, key, ...))

let rounds2Matches = roundList => {
  module Q = Belt.MutableQueue
  let q = Q.make()
  Array.forEach(roundList, r => r->Q.fromArray->Q.transfer(q))
  q
}

let isRoundComplete = (roundList, players, roundId) =>
  switch roundList[roundId] {
  | Some(round) =>
    /* If it's not the last round, it's complete. */
    if roundId < Array.length(roundList) - 1 {
      true
    } else {
      let matched = Round.getMatched(round)
      let unmatched = Belt.Map.removeMany(players, matched)
      let results = Array.map(round, match => match.result)
      Belt.Map.size(unmatched) == 0 && !Js.Array.includes(Match.Result.NotSet, results)
    }
  | None => true
  }

let addRound = roundList => Array.concat(roundList, [[]])

let delLastRound = roundList => Js.Array.slice(0, ~end_=-1, ~obj=roundList)

let updateByeScores = (rounds: t, byeValue) =>
  Array.map(rounds, round =>
    Array.map(round, m => {
      ...m,
      result: Match.Result.scoreByeMatch(
        ~white=m.whiteId,
        ~black=m.blackId,
        ~default=m.result,
        ~byeValue,
      ),
    })
  )
