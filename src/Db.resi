/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
let loadDemoDB: unit => unit

module Config: module type of LocalForage.Id.MakeEncodable(Coronate.Data.Config)

module Tournament: module type of LocalForage.Id.MakeEncodable(Coronate.Data.Tournament)

module Player: module type of LocalForage.Id.MakeEncodable(Coronate.Data.Player)

let tournaments: LocalForage.Map.t<Data.Tournament.t, Tournament.identity>

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
  | SetLastBackup(Js.Date.t)
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
