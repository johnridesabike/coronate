/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
@react.component
let make: (
  ~roundId: int,
  ~tournament: LoadTournament.t,
  ~scoreData: Data.Id.Map.t<Data.Scoring.t>,
  ~unmatched: Data.Id.Map.t<Data.Player.t>,
  ~unmatchedWithDummy: Data.Id.Map.t<Data.Player.t>,
) => React.element
