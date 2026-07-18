/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/** Ensure that all LocalForage plugins get loaded. */
let init: unit => unit

let loadDemoDB: unit => unit

let getTourney: Data.Id.t => Promise.t<option<Data.Tournament.t>>
let setTourney: (Data.Id.t, Data.Tournament.t) => Promise.t<unit>

type action<'a> =
  | Del(Data.Id.t)
  | Set(Data.Id.t, 'a)
  | SetAll(Data.Id.Map.t<'a>)

type state<'a> = {
  items: Data.Id.Map.t<'a>,
  dispatch: action<'a> => unit,
  loaded: bool,
}

let useAllPlayers: unit => state<Data.Player.t>

let useAllTournaments: unit => state<Data.Tournament.t>

type actionConfig =
  | AddAvoidPair(Data.Id.Pair.t)
  | DelAvoidPair(Data.Id.Pair.t)
  | DelAvoidSingle(Data.Id.t)
  | SetAvoidPairs(Data.Id.Pair.Set.t)
  | SetByeValue(Data.Config.ByeValue.t)
  | SetState(Data.Config.t)
  | SetLastBackup(Date.t)
  | SetWhiteAlias(string)
  | SetBlackAlias(string)

let useConfig: unit => (Data.Config.t, actionConfig => unit)

type actionAuth =
  | SetGitHubToken(string)
  | SetGistId(string)
  | RemoveGistId
  | SetState(Data.Auth.t)
  | Reset

let useAuth: unit => (Data.Auth.t, actionAuth => unit)
