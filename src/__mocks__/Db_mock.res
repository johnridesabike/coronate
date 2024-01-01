/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open Belt

let localForageConfig = LocalForage.Config.make(~name="Coronate")
module Config = LocalForage.Id.MakeEncodable(Data.Config)
module Player = LocalForage.Id.MakeEncodable(Data.Player)
module Tournament = LocalForage.Id.MakeEncodable(Data.Tournament)
let tournaments = LocalForage.Map.make(
  localForageConfig(~storeName="Tournaments", ()),
  module(Tournament),
)

let loadDemoDB = () => ()

/* copied from Db */
type action<'a> = Db.action<'a> = Del(Data.Id.t) | Set(Data.Id.t, 'a) | SetAll(Data.Id.Map.t<'a>)

type state<'a> = Db.state<'a> = {
  items: Data.Id.Map.t<'a>,
  dispatch: action<'a> => unit,
  loaded: bool,
}

let genericDbReducer = (state, action) =>
  switch action {
  | Set(id, item) => state->Map.set(id, item)
  | Del(id) => state->Map.remove(id)
  | SetAll(state) => state
  }

type actionConfig = Db.actionConfig =
  | AddAvoidPair(Data.Id.Pair.t)
  | DelAvoidPair(Data.Id.Pair.t)
  | DelAvoidSingle(Data.Id.t)
  | SetAvoidPairs(Data.Id.Pair.Set.t)
  | SetByeValue(Data.Config.ByeValue.t)
  | SetState(Data.Config.t)
  | SetLastBackup(Js.Date.t)
  | SetWhiteAlias(string)
  | SetBlackAlias(string)

let configReducer = (state: Data.Config.t, action): Data.Config.t => {
  switch action {
  | AddAvoidPair(pair) => {...state, avoidPairs: state.avoidPairs->Set.add(pair)}
  | DelAvoidPair(pair) => {
      ...state,
      avoidPairs: state.avoidPairs->Set.remove(pair),
    }
  | DelAvoidSingle(id) => {
      ...state,
      avoidPairs: Set.keep(state.avoidPairs, pair => !Data.Id.Pair.has(pair, ~id)),
    }
  | SetAvoidPairs(avoidPairs) => {...state, avoidPairs}
  | SetByeValue(byeValue) => {...state, byeValue}
  | SetLastBackup(lastBackup) => {...state, lastBackup}
  | SetWhiteAlias(s) => {...state, whiteAlias: Data.Config.alias(s)}
  | SetBlackAlias(s) => {...state, blackAlias: Data.Config.alias(s)}
  | SetState(state) => state
  }
}
/* Instead of taking an IndexedDB store as an argument, this takes an object
 with the mocked data. */
let useAllItemsFromDb = data => {
  let (items, dispatch) = React.useReducer(genericDbReducer, data)
  {items, dispatch, loaded: true}
}

let useAllPlayers = () => useAllItemsFromDb(TestData.players)

let useAllTournaments = () => useAllItemsFromDb(TestData.tournaments)

let useConfig = () => React.useReducer(configReducer, TestData.config)

type actionAuth = Db.actionAuth =
  | SetGitHubToken(string)
  | SetGistId(string)
  | RemoveGistId
  | SetState(Data.Auth.t)
  | Reset

let useAuth = () => (Data.Auth.default, _ => ())
