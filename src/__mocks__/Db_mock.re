open Belt;
open TestData;
let configData = Data.Config.{
  ...config,
  avoidPairs:
    config.avoidPairs->Set.mergeMany(DemoData.config.avoidPairs->Set.toArray),
};

let merger = (_key, a, b) => {
  switch (a, b) {
  | (Some(a), _) => Some(a)
  | (_, Some(b)) => Some(b)
  | (None, None) => None
  };
};

let tournamentData =
  Map.String.merge(tournaments, DemoData.tournaments, merger);
let playerData = Map.String.merge(players, DemoData.players, merger);

/* copied from Db */
type action('a) =
  | Del(string)
  | Set(string, 'a)
  | SetAll(Map.String.t('a));
let genericDbReducer = (state, action) => {
  switch (action) {
  | Set(id, item) => state->Map.String.set(id, item)
  | Del(id) => state->Map.String.remove(id)
  | SetAll(state) => state
  };
};

type actionConfig =
  | AddAvoidPair(Data.Config.AvoidPairs.pair)
  | DelAvoidPair(Data.Config.AvoidPairs.pair)
  | DelAvoidSingle(string)
  | SetAvoidPairs(Data.Config.AvoidPairs.t)
  | SetByeValue(Data.Config.ByeValue.t)
  | SetState(Data.Config.t)
  | SetLastBackup(Js.Date.t);

let configReducer = (state, action) => {
  open Data.Config;
  switch (action) {
  | AddAvoidPair(pair) =>
    Data.Config.{...state, avoidPairs: state.avoidPairs->Set.add(pair)}
  | DelAvoidPair(pair) => {
      ...state,
      avoidPairs: state.avoidPairs->Set.remove(pair),
    }
  | DelAvoidSingle(id) => {
      ...state,
      avoidPairs:
        state.avoidPairs
        ->Set.reduce(Data.Config.AvoidPairs.empty, (acc, (p1, p2)) =>
            if (p1 === id || p2 === id) {
              acc;
            } else {
              acc->Set.add((p1, p2));
            }
          ),
    }
  | SetAvoidPairs(avoidPairs) => {...state, avoidPairs}
  | SetByeValue(byeValue) => {...state, byeValue}
  | SetLastBackup(lastBackup) => {...state, lastBackup}
  | SetState(state) => state
  };
};
/* Instead of taking an IndexedDB store as an argument, this takes an object
   with the mocked data. */
let useAllItemsFromDb = data => React.useReducer(genericDbReducer, data);
let useAllPlayers = () => useAllItemsFromDb(playerData);
let useAllTournaments = () => useAllItemsFromDb(tournaments);
let useConfig = () => React.useReducer(configReducer, configData);