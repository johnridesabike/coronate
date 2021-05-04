/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
module RoundTable: {
  @react.component
  let make: (
    ~isCompact: bool=?,
    ~roundId: int,
    ~matches: array<Data.Match.t>,
    ~selectedMatch: Data.Id.t=?,
    ~setSelectedMatch: ('a => option<Data_Id.t>) => unit=?,
    ~tournament: LoadTournament.t,
    ~scoreData: Data.Id.Map.t<Data_Scoring.t>=?,
  ) => React.element
}

@react.component
let make: (~roundId: int, ~tournament: LoadTournament.t) => React.element
