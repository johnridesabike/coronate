/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/** Use LocalForage to automatically save state data in browsers. In a testing environment, replace
    it with an in-memory read-only store. */
module type Encodable = {
  type t
  let encode: t => JSON.t
  let decode: JSON.t => t
}

type encodable<'a> = module(Encodable with type t = 'a)

type config

@obj
external config: (~name: string, ~storeName: string, unit) => config = ""

/** A generic storage interface. */
module type STORE = {
  /** A "record" stores an entire data structure in one instance. */
  module Record: {
    type t<'a>
    let make: (config, encodable<'a>) => t<'a>
    let set: (t<'a>, ~items: 'a) => Promise.t<unit>
    let get: t<'a> => Promise.t<'a>
    let setDataForTesting: (t<'a>, ~items: 'a) => unit
  }

  /** A "map" stores many values mapped to keys. */
  module Map: {
    type t<'a>
    let make: (config, encodable<'a>) => t<'a>
    let getItem: (t<'a>, ~key: Data.Id.t) => Promise.t<option<'a>>
    let setItem: (t<'a>, ~key: Data.Id.t, ~v: 'a) => Promise.t<unit>
    let setItems: (t<'a>, ~items: Data.Id.Map.t<'a>) => Promise.t<unit>
    let getAllItems: t<'a> => Promise.t<array<(string, 'a)>>
    let getKeys: t<'a> => Promise.t<array<string>>
    let removeItems: (t<'a>, ~items: array<string>) => Promise.t<unit>
    let setDataForTesting: (t<'a>, ~items: Data.Id.Map.t<'a>) => unit
  }

  let init: unit => unit
  let clear: unit => Promise.t<unit>
}

module LocalForage: STORE = {
  type localforage

  @module("localforage") @scope("default")
  external createInstance: config => localforage = "createInstance"

  @module("localforage") @scope("default") external clear: unit => Promise.t<unit> = "clear"

  @send
  external setItem: (localforage, string, JSON.t) => Promise.t<unit> = "setItem"
  @send
  external getItem: (localforage, string) => Promise.t<Nullable.t<JSON.t>> = "getItem"
  @send external keys: localforage => Promise.t<array<string>> = "keys"

  module GetItems = {
    @module("localforage-getitems")
    external extendPrototype: localforage => unit = "extendPrototype"
    @send
    external allDict: localforage => Promise.t<dict<JSON.t>> = "getItems"
    @send external allJson: localforage => Promise.t<JSON.t> = "getItems"
  }

  module RemoveItems = {
    @module("localforage-removeitems")
    external extendPrototype: localforage => unit = "extendPrototype"
    @send
    external fromArray: (localforage, array<string>) => Promise.t<unit> = "removeItems"
  }

  module SetItems = {
    @module("localforage-setitems")
    external extendPrototype: localforage => unit = "extendPrototype"
    @send
    external fromDict: (localforage, dict<JSON.t>) => Promise.t<unit> = "setItems"
    @send
    external fromJson: (localforage, JSON.t) => Promise.t<unit> = "setItems"
  }

  module Record = {
    type t<'a> = {
      store: localforage,
      encode: 'a => JSON.t,
      decode: JSON.t => 'a,
    }

    let make = (type t, config, data: encodable<t>) => {
      module Data = unpack(data)
      {store: createInstance(config), encode: Data.encode, decode: Data.decode}
    }

    let get = async ({store, decode, _}) => {
      let items = await GetItems.allJson(store)
      decode(items)
    }

    let set = ({store, encode, _}, ~items) => SetItems.fromJson(store, encode(items))
    let setDataForTesting = (_, ~items as _) => ()
  }

  module Map = {
    type t<'a> = {
      store: localforage,
      encode: 'a => JSON.t,
      decode: JSON.t => 'a,
    }

    let make = (type t, config, data: encodable<t>) => {
      module Data = unpack(data)
      {store: createInstance(config), encode: Data.encode, decode: Data.decode}
    }

    let getItem = async ({store, decode, _}, ~key) => {
      let value = await getItem(store, Data.Id.toString(key))
      value->Nullable.toOption->Option.map(decode)
    }

    let setItem = ({store, encode, _}, ~key, ~v) => setItem(store, Data.Id.toString(key), encode(v))

    let getKeys = ({store, _}) => keys(store)

    let mapValues = ((key, value), ~f) => (key, f(value))

    let parseItems = (decode, items) => items->Dict.toArray->Array.map(mapValues(~f=decode, ...))

    let getAllItems = async ({store, decode, _}) => {
      let items = await GetItems.allDict(store)
      parseItems(decode, items)
    }

    let setItems = ({store, encode, _}, ~items) =>
      items
      ->Belt.Map.map(encode)
      ->Data.Id.Map.toStringArray
      ->Dict.fromArray
      ->SetItems.fromDict(store, _)

    let removeItems = ({store, _}, ~items) => RemoveItems.fromArray(store, items)
    let setDataForTesting = (_, ~items as _) => ()
  }

  @module("localforage") external localForage: localforage = "default"

  let init = () => {
    GetItems.extendPrototype(localForage)
    RemoveItems.extendPrototype(localForage)
    SetItems.extendPrototype(localForage)
  }
}

/** This store reads data from memory. Writing to it is a no-op. */
module TestStore: STORE = {
  module Record = {
    type t<'a> = ref<option<'a>>
    let make = (_, _) => ref(None)
    let set = async (_, ~items as _) => ()
    let get = t =>
      switch t.contents {
      | None => Promise.reject(Not_found)
      | Some(x) => Promise.resolve(x)
      }
    let setDataForTesting = (t, ~items) => t.contents = Some(items)
  }

  module Map = {
    type t<'a> = ref<Data.Id.Map.t<'a>>
    let make = (_, _) => ref(Belt.Map.make(~id=Data.Id.id))
    let getItem = async (t, ~key) => t.contents->Belt.Map.get(key)
    let setItem = async (_, ~key as _, ~v as _) => ()
    let setItems = async (_, ~items as _) => ()
    let getAllItems = async t => t.contents->Data.Id.Map.toStringArray
    let getKeys = async t => t.contents->Data.Id.Map.keysToStringArray
    let removeItems = async (_, ~items as _) => ()
    let setDataForTesting = (t, ~items) => t.contents = items
  }

  let init = () => ()
  let clear = async () => ()
}

@val external isTest: bool = "__IS_TEST__"

let store: module(STORE) = if isTest {
  module(TestStore)
} else {
  module(LocalForage)
}

module Store = unpack(store)

let init = Store.init

/* ******************************************************************************
 * Initialize the databases
 ***************************************************************************** */
let localForageConfig = config(~name="Coronate", ...)
let configDb = Store.Record.make(localForageConfig(~storeName="Options", ()), module(Data.Config))
let authDb = Store.Record.make(localForageConfig(~storeName="Auth", ()), module(Data.Auth))
let players = Store.Map.make(localForageConfig(~storeName="Players", ()), module(Data.Player))
let tournaments = Store.Map.make(
  localForageConfig(~storeName="Tournaments", ()),
  module(Data.Tournament),
)

if isTest {
  configDb->Store.Record.setDataForTesting(~items=TestData.config)
  tournaments->Store.Map.setDataForTesting(~items=TestData.tournaments)
  players->Store.Map.setDataForTesting(~items=TestData.players)
}

let getTourney = key => Store.Map.getItem(tournaments, ~key)
let setTourney = (key, v) => Store.Map.setItem(tournaments, ~key, ~v)

let loadDemoDB = (_): unit => {
  let () = %raw(`document.body.style.cursor = "wait"`)
  Promise.all3((
    Store.Record.set(configDb, ~items=DemoData.config),
    Store.Map.setItems(players, ~items=DemoData.players),
    Store.Map.setItems(tournaments, ~items=DemoData.tournaments),
  ))
  ->Promise.thenResolve(_ => Webapi.Dom.Window.alert(Webapi.Dom.window, "Demo data loaded!"))
  ->Promise.catch(_ => {
    let () = %raw(`document.body.style.cursor = "auto"`)
    Webapi.Dom.Window.alert(Webapi.Dom.window, "Couldn't load demo data.")
    Promise.resolve()
  })
  ->Promise.finally(_ => {
    let () = %raw(`document.body.style.cursor = "auto"`)
  })
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
  | Set(id, item) => Belt.Map.set(state, id, item)
  | Del(id) => Belt.Map.remove(state, id)
  | SetAll(state) => state
  }

let useAllDb = store => {
  let (items, dispatch) = React.useReducer(genericDbReducer, Belt.Map.make(~id=Data.Id.id))
  let loaded = Hooks.useBool(false)
  Hooks.useLoadingCursorUntil(loaded.state)
  /*
    Load items from the database.
 */
  React.useEffect0(() => {
    let didCancel = ref(false)
    Store.Map.getAllItems(store)
    ->Promise.thenResolve(results =>
      if !didCancel.contents {
        dispatch(SetAll(results->Data.Id.Map.fromStringArray))
        loaded.setTrue()
      }
    )
    ->Promise.catch(error => {
      if !didCancel.contents {
        /* Even if there was an error, we'll clear the database. This means a
             corrupt database will get wiped. In the future, we may need to
             replace this with more elegant error recovery. */
        Console.error(error)
        Store.clear()->ignore
        loaded.setTrue()
      }
      Promise.resolve()
    })
    ->ignore
    Some(() => didCancel := true)
  })
  /*
    Save items to the database.
 */
  React.useEffect2(() => {
    if loaded.state {
      store
      ->Store.Map.setItems(~items)
      /* Delete any DB keys that aren't present in the state, with the
         assumption that the state must have intentionally removed them.

         This is vulnerable to a race condition where if the effect fires too
         quickly, the state from a stale render will delete DB keys from a
         newer render.
         
         It needs to be fixed. */
      ->Promise.then(_ => Store.Map.getKeys(store))
      ->Promise.then(keys => {
        let deleted = Array.filter(keys, x => !Belt.Map.has(items, Data.Id.fromString(x)))
        Store.Map.removeItems(store, ~items=deleted)
      })
      ->ignore
    }
    None
  }, (items, loaded.state))
  {items, dispatch, loaded: loaded.state}
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
  | SetLastBackup(Date.t)
  | SetWhiteAlias(string)
  | SetBlackAlias(string)

let configReducer = (state: Data.Config.t, action): Data.Config.t => {
  switch action {
  | AddAvoidPair(pair) => {
      ...state,
      avoidPairs: Belt.Set.add(state.avoidPairs, pair),
    }
  | DelAvoidPair(pair) => {
      ...state,
      avoidPairs: Belt.Set.remove(state.avoidPairs, pair),
    }
  | DelAvoidSingle(id) => {
      ...state,
      avoidPairs: Belt.Set.keep(state.avoidPairs, pair => !Data.Id.Pair.has(pair, ~id)),
    }
  | SetAvoidPairs(avoidPairs) => {...state, avoidPairs}
  | SetByeValue(byeValue) => {...state, byeValue}
  | SetLastBackup(lastBackup) => {...state, lastBackup}
  | SetWhiteAlias(s) => {...state, whiteAlias: Data.Config.alias(s)}
  | SetBlackAlias(s) => {...state, blackAlias: Data.Config.alias(s)}
  | SetState(state) => state
  }
}

let useConfig = () => {
  let (config, dispatch) = React.useReducer(configReducer, Data.Config.default)
  let loaded = Hooks.useBool(false)
  /* Load items from the database. */
  React.useEffect0(() => {
    let didCancel = ref(false)
    Store.Record.get(configDb)
    ->Promise.thenResolve(values =>
      if !didCancel.contents {
        dispatch(SetState(values))
        loaded.setTrue()
      }
    )
    ->Promise.catch(error => {
      if !didCancel.contents {
        Console.error(error)
        Store.clear()->ignore
        dispatch(SetState(Data.Config.default))
        loaded.setTrue()
      }
      Promise.resolve()
    })
    ->ignore
    Some(() => didCancel := true)
  })
  /* Save items to the database. */
  React.useEffect2(() => {
    if loaded.state {
      Store.Record.set(configDb, ~items=config)->ignore
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
    Store.Record.get(authDb)
    ->Promise.thenResolve(values =>
      if !didCancel.contents {
        dispatch(SetState(values))
        loaded.setTrue()
      }
    )
    ->Promise.catch(_ => {
      if !didCancel.contents {
        Store.clear()->ignore
        dispatch(SetState(Data.Auth.default))
        loaded.setTrue()
      }
      Promise.resolve()
    })
    ->ignore
    Some(() => didCancel := true)
  })
  /* Save items to the database. */
  React.useEffect2(() => {
    if loaded.state {
      Store.Record.set(authDb, ~items=auth)->ignore
    }
    None
  }, (auth, loaded.state))
  (auth, dispatch)
}
