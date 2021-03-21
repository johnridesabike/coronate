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

let configReducer = (state: Data.Config.t, action): Data.Config.t => {
  switch action {
  | AddAvoidPair(pair) => {...state, avoidPairs: state.avoidPairs->Set.add(pair)}
  | DelAvoidPair(pair) => {
      ...state,
      avoidPairs: state.avoidPairs->Set.remove(pair),
    }
  | DelAvoidSingle(id) => {
      ...state,
      avoidPairs: state.avoidPairs->Set.reduce(Data.Id.Pair.Set.empty, (acc, pair) =>
        if Data.Id.Pair.has(pair, ~id) {
          acc
        } else {
          acc->Set.add(pair)
        }
      ),
    }
  | SetAvoidPairs(avoidPairs) => {...state, avoidPairs: avoidPairs}
  | SetByeValue(byeValue) => {...state, byeValue: byeValue}
  | SetLastBackup(lastBackup) => {...state, lastBackup: lastBackup}
  | SetState(state) => state
  }
}
/* Instead of taking an IndexedDB store as an argument, this takes an object
 with the mocked data. */
let useAllItemsFromDb = data => {
  let (items, dispatch) = React.useReducer(genericDbReducer, data)
  {items: items, dispatch: dispatch, loaded: true}
}

let useAllPlayers = () => useAllItemsFromDb(TestData.players)

let useAllTournaments = () => useAllItemsFromDb(TestData.tournaments)

let useConfig = () => React.useReducer(configReducer, TestData.config)
