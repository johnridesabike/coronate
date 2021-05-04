/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
module Selecting: {
  @react.component
  let make: (
    ~tourney: Data.Tournament.t,
    ~setTourney: Data.Tournament.t => unit,
    ~players: Data.Id.Map.t<Data.Player.t>,
    ~playersDispatch: Db.action<Data.Player.t> => unit,
  ) => React.element
}

@react.component
let make: (~tournament: LoadTournament.t) => React.element
