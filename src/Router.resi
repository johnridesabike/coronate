/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
module TourneyPage: {
  type t =
    | Players
    | Scores
    | Crosstable
    | Setup
    | Status
    | Round(int)
}

type t =
  | Index
  | TournamentList
  | Tournament(Data.Id.t, TourneyPage.t)
  | PlayerList
  | Player(Data.Id.t)
  | TimeCalculator
  | Options
  | NotFound

let useHashUrl: unit => t

module HashLink: {
  @react.component
  let make: (
    ~children: React.element,
    ~to_: t,
    ~onDragStart: ReactEvent.Mouse.t => unit=?,
    ~onClick: ReactEvent.Mouse.t => unit=?,
  ) => React.element
}
