/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open Belt

/* ******************************************************************************
 * Initialize the databases
 ***************************************************************************** */
let localForageConfig = LocalForage.Config.make(~name="Coronate")
module Config = LocalForage.Id.MakeEncodable(Data.Config)
module Player = LocalForage.Id.MakeEncodable(Data.Player)
module Tournament = LocalForage.Id.MakeEncodable(Data.Tournament)
module Auth = LocalForage.Id.MakeEncodable(Data.Auth)
let configDb = LocalForage.Record.make(localForageConfig(~storeName="Options", ()), module(Config))
let authDb = LocalForage.Record.make(localForageConfig(~storeName="Auth", ()), module(Auth))
let players = LocalForage.Map.make(localForageConfig(~storeName="Players", ()), module(Player))
let tournaments = LocalForage.Map.make(
  localForageConfig(~storeName="Tournaments", ()),
  module(Tournament),
)

let loadDemoDB = _ => {
  let () = %raw(`document.body.style.cursor = "wait"`)
  Promise.all3((
    LocalForage.Record.set(configDb, ~items=DemoData.config),
    LocalForage.Map.setItems(players, ~items=DemoData.players->Data.Id.Map.toStringArray),
    LocalForage.Map.setItems(tournaments, ~items=DemoData.tournaments->Data.Id.Map.toStringArray),
  ))
  ->Promise.then(_ => Promise.resolve(Utils.alert("Demo data loaded!")))
  ->Promise.catch(e => {
    Js.Console.error(e)
    Utils.alert(
      "I couldn't load demo data. You can find further information in the console.",
    )->Promise.resolve
  })
  ->Promise.finally(() => %raw(`document.body.style.cursor = "auto"`))
  ->ignore
}
/* ******************************************************************************
 * Generic database hooks
 ***************************************************************************** */
type action<'a> =
  | Del(Data.Id.t)
  | Set(Data.Id.t, 'a)
  | SetAll(Data.Id.Map.t<'a>)

type state<'a> = {
  items: Data.Id.Map.t<'a>,
  dispatch: action<'a> => unit,
  loaded: bool,
}

let genericDbReducer = (state, action) =>
  switch action {
  | Set(id, item) => Map.set(state, id, item)
  | Del(id) => Map.remove(state, id)
  | SetAll(state) => state
  }

let useAllDb = store => {
  let (items, dispatch) = React.useReducer(genericDbReducer, Map.make(~id=Data.Id.id))
  let loaded = Hooks.useBool(false)
  Hooks.useLoadingCursorUntil(loaded.state)
  /* Load items from the database. */
  React.useEffect0(() => {
    let didCancel = ref(false)
    LocalForage.Map.getAllItems(store)
    ->Promise.then(results => {
      if !didCancel.contents {
        dispatch(SetAll(Data.Id.Map.fromStringArray(results)))
        loaded.setTrue()
      }
      Promise.resolve()
    })
    ->Promise.catch(error => {
      if !didCancel.contents {
        /* Even if there was an error, we'll clear the database. This means a
             corrupt database will get wiped. In the future, we may need to
             replace this with more elegant error recovery. */
        ()->LocalForage.Js.clear->ignore
        loaded.setTrue()
      }
      Promise.resolve(Js.Console.error(error))
    })
    ->ignore
    Some(() => didCancel := true)
  })
  /* Save items to the database. */
  React.useEffect2(() => {
    if loaded.state {
      store
      ->LocalForage.Map.setItems(~items=Data.Id.Map.toStringArray(items))
      /* Delete any DB keys that aren't present in the state, with the
         assumption that the state must have intentionally removed them.

         This is vulnerable to a race condition where if the effect fires too
         quickly, the state from a stale render will delete DB keys from a
         newer render.
         
         It needs to be fixed. */
      ->Promise.then(() => LocalForage.Map.getKeys(store))
      ->Promise.then(keys => {
        let deleted = Array.keep(keys, x => !Map.has(items, Data.Id.fromString(x)))
        switch deleted {
        | [] => Promise.resolve()
        | deleted => LocalForage.Map.removeItems(store, ~items=deleted)
        }
      })
      ->Promise.catch(e => Promise.resolve(Js.Console.error(e)))
      ->ignore
    }
    None
  }, (items, loaded.state))
  {items: items, dispatch: dispatch, loaded: loaded.state}
}

let useAllPlayers = () => useAllDb(players)

let useAllTournaments = () => useAllDb(tournaments)

type actionConfig =
  | AddAvoidPair(Data.Id.Pair.t)
  | DelAvoidPair(Data.Id.Pair.t)
  | DelAvoidSingle(Data.Id.t)
  | SetAvoidPairs(Data.Id.Pair.Set.t)
  | SetByeValue(Data.Config.ByeValue.t)
  | SetState(Data.Config.t)
  | SetLastBackup(Js.Date.t)

let configReducer = (state: Data.Config.t, action): Data.Config.t => {
  switch action {
  | AddAvoidPair(pair) => {
      ...state,
      avoidPairs: Set.add(state.avoidPairs, pair),
    }
  | DelAvoidPair(pair) => {
      ...state,
      avoidPairs: Set.remove(state.avoidPairs, pair),
    }
  | DelAvoidSingle(id) => {
      ...state,
      avoidPairs: Set.keep(state.avoidPairs, pair => !Data.Id.Pair.has(pair, ~id)),
    }
  | SetAvoidPairs(avoidPairs) => {...state, avoidPairs: avoidPairs}
  | SetByeValue(byeValue) => {...state, byeValue: byeValue}
  | SetLastBackup(lastBackup) => {...state, lastBackup: lastBackup}
  | SetState(state) => state
  }
}

let useConfig = () => {
  let (config, dispatch) = React.useReducer(configReducer, Data.Config.default)
  let loaded = Hooks.useBool(false)
  /* Load items from the database. */
  React.useEffect0(() => {
    let didCancel = ref(false)
    LocalForage.Record.get(configDb)
    ->Promise.then(values => {
      if !didCancel.contents {
        dispatch(SetState(values))
        loaded.setTrue()
      }
      Promise.resolve()
    })
    ->Promise.catch(e => {
      if !didCancel.contents {
        ()->LocalForage.Js.clear->ignore
        dispatch(SetState(Data.Config.default))
        loaded.setTrue()
      }
      Promise.resolve(Js.Console.error(e))
    })
    ->ignore
    Some(() => didCancel := true)
  })
  /* Save items to the database. */
  React.useEffect2(() => {
    if loaded.state {
      LocalForage.Record.set(configDb, ~items=config)->ignore
    }
    None
  }, (config, loaded.state))
  (config, dispatch)
}

type actionAuth =
  | SetGitHubToken(string)
  | SetGistId(string)
  | RemoveGistId
  | SetState(Data.Auth.t)
  | Reset

let authReducer = (state: Data.Auth.t, action) =>
  switch action {
  | Reset => Data.Auth.default
  | SetGitHubToken(token) => {...state, github_token: token}
  | SetGistId(id) => {...state, github_gist_id: id}
  | RemoveGistId => {...state, github_gist_id: ""}
  | SetState(state) => state
  }

let useAuth = () => {
  let (auth, dispatch) = React.useReducer(authReducer, Data.Auth.default)
  let loaded = Hooks.useBool(false)
  /* Load items from the database. */
  React.useEffect0(() => {
    let didCancel = ref(false)
    LocalForage.Record.get(authDb)
    ->Promise.Js.fromBsPromise
    ->Promise.Js.toResult
    ->Promise.tapOk(values =>
      if !didCancel.contents {
        dispatch(SetState(values))
        loaded.setTrue()
      }
    )
    ->Promise.getError(_ =>
      if !didCancel.contents {
        ()->LocalForage.Js.clear->ignore
        dispatch(SetState(Data.Auth.default))
        loaded.setTrue()
      }
    )
    Some(() => didCancel := true)
  })
  /* Save items to the database. */
  React.useEffect2(() => {
    if loaded.state {
      LocalForage.Record.set(authDb, ~items=auth)->ignore
    }
    None
  }, (auth, loaded.state))
  (auth, dispatch)
}
