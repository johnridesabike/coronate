open Belt;
open TestData;
let configData = {
  ...config,
  avoidPairs:
    config.avoidPairs->Set.mergeMany(DemoData.config.avoidPairs->Set.toArray),
};
let tournamentData =
  tournaments->Map.String.merge(DemoData.tournaments, (_, _, a) => a);
let playerData = players->Map.String.merge(DemoData.players, (_, _, a) => a);

/* copied from Db */
type actionDb('a) =
  | DelItem(string)
  | SetItem(string, 'a)
  | SetState(Map.String.t('a));
type genericReducer('a) =
  (Map.String.t('a), actionDb('a)) => Map.String.t('a);
let genericDbReducer = (state, action) => {
  switch (action) {
  | SetItem(id, item) => state->Map.String.set(id, item)
  | DelItem(id) => state->Map.String.remove(id)
  | SetState(state) => state
  };
};

type actionConfig =
  | AddAvoidPair(Data.Config.AvoidPairs.pair)
  | DelAvoidPair(Data.Config.AvoidPairs.pair)
  | DelAvoidSingle(string)
  | SetAvoidPairs(Data.Config.AvoidPairs.t)
  | SetByeValue(Data.ByeValue.t)
  | SetState(Data.Config.t)
  | SetLastBackup(Js.Date.t);

let configReducer = (state, action) => {
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
        ->Set.reduce(Data.Config.AvoidPairs.make(), (acc, (p1, p2)) =>
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