/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
@ocaml.doc("
 I extracted this logic to its own module so it could be easily
 reused (e.g. in testing). It may have also made the whole component tree more
 complicated.
 ")
type roundData = {
  scoreData: Data.Id.Map.t<Data.Scoring.t>,
  unmatched: Data.Id.Map.t<Data.Player.t>,
  unmatchedWithDummy: Data.Id.Map.t<Data.Player.t>,
}

let useRoundData: (int, LoadTournament.t) => roundData

@ocaml.doc("
 For the two components that use this, their logic is basically the same but
 their markup is slightly different. We may want to just merge them into one
 component instead of managing two similar components and one higher-order
 component.
 ")
type scoreInfo = {
  player: Data.Player.t,
  hasBye: bool,
  colorBalance: string,
  score: float,
  rating: React.element,
  opponentResults: React.element,
  avoidListHtml: React.element,
}

let getScoreInfo: (
  ~player: Data.Player.t,
  ~scoreData: Data.Id.Map.t<Data.Scoring.t>,
  ~avoidPairs: Data.Id.Pair.Set.t,
  ~getPlayer: Data.Id.t => Data.Player.t,
  ~players: Data.Id.Map.t<Data.Player.t>,
  ~origRating: int,
  ~newRating: option<int>,
) => scoreInfo
