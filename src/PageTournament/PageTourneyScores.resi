/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
@react.component
let make: (~tournament: LoadTournament.t) => React.element

type size =
  | Compact
  | Expanded

module ScoreTable: {
  @react.component
  let make: (
    ~size: size,
    ~tourney: Data.Tournament.t,
    ~getPlayer: Data.Id.t => Data.Player.t,
    ~title: string,
  ) => React.element
}

module Crosstable: {
  @react.component
  let make: (~tournament: LoadTournament.t) => React.element
}
