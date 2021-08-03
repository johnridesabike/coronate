/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
@ocaml.doc("
 * The round structure is currently just nested arrays. Because arrays are
 * awkward to manipulate, the functions are consolidated here. In the future,
 * I may replace the arrays with a different data type, so hopefully it will be
 * simple to rewrite this module if necessary (versus rewriting every
 * component).
 ")
open Belt
module Match = Data_Match
module Id = Data_Id

module Round = {
  type t = array<Match.t>

  let fromArray = x => x

  let toArray = x => x

  let empty: t = []

  let encode = t => t->Array.map(Match.encode)->Js.Json.array

  @raises(Not_found)
  let decode = json => Js.Json.decodeArray(json)->Option.getExn->Array.map(Match.decode)

  let size = Js.Array2.length

  let addMatches = Array.concat

  /* flatten all of the ids from the matches to one array. */
  let getMatched = (round: t) => {
    let q = MutableQueue.make()
    Array.forEach(round, ({whiteId, blackId, _}) => {
      MutableQueue.add(q, whiteId)
      MutableQueue.add(q, blackId)
    })
    MutableQueue.toArray(q)
  }

  let getMatchById = (round: t, id) => Array.getBy(round, x => Id.eq(x.id, id))

  let removeMatchById = (round: t, id) => Array.keep(round, x => !Id.eq(x.id, id))

  let setMatch = (round: t, match: Data_Match.t) => {
    let round = Array.copy(round)
    round
    ->Array.getIndexBy(({Match.id: id, _}) => Id.eq(id, match.id))
    ->Option.map(x => round[x] = match)
    ->Option.flatMap(wasSuccessful => wasSuccessful ? Some(round) : None)
  }

  let moveMatch = (round, matchId, direction) =>
    switch getMatchById(round, matchId) {
    | None => None
    | Some(match_) =>
      let oldIndex = Js.Array2.indexOf(round, match_)
      let newIndex = oldIndex + direction >= 0 ? oldIndex + direction : 0
      Some(Utils.Array.swap(round, oldIndex, newIndex))
    }
}

type t = array<Round.t>

let fromArray = x => x

let toArray = x => x

let empty: t = [[]]

let encode = t => t->Array.map(Round.encode)->Js.Json.array

@raises(Not_found)
let decode = json => Js.Json.decodeArray(json)->Option.getExn->Array.map(Round.decode)

let size = Js.Array2.length

let getLastKey = rounds => Array.length(rounds) - 1

let get = Array.get

let set = (rounds, key, round) => {
  let rounds = Array.copy(rounds)
  let wasSuccessful = rounds[key] = round
  wasSuccessful ? Some(rounds) : None
}

let setMatch = (rounds, key, match_) =>
  rounds->get(key)->Option.flatMap(Round.setMatch(_, match_))->Option.flatMap(set(rounds, key))

let rounds2Matches = roundList => {
  module Q = MutableQueue
  let q = Q.make()
  Array.forEach(roundList, r => r->Q.fromArray->Q.transfer(q))
  q
}

let isRoundComplete = (roundList, players, roundId) =>
  switch roundList[roundId] {
  | Some(round) =>
    /* If it's not the last round, it's complete. */
    if roundId < Array.size(roundList) - 1 {
      true
    } else {
      let matched = Round.getMatched(round)
      let unmatched = Map.removeMany(players, matched)
      let results = Array.map(round, match => match.result)
      Map.size(unmatched) == 0 && !Js.Array2.includes(results, NotSet)
    }
  | None => true
  }

let addRound = roundList => Array.concat(roundList, [[]])

let delLastRound = roundList => Js.Array2.slice(roundList, ~start=0, ~end_=-1)

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
