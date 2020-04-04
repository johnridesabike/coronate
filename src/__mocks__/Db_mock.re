open Belt;
open TestData;

let configData =
  Data.Config.{
    ...config,
    avoidPairs:
      config.avoidPairs
      ->Set.mergeMany(DemoData.config.avoidPairs->Set.toArray),
  };

let tournamentData = Array.concat(tournaments, DemoData.tournaments);
let playerData = Array.concat(players, DemoData.players);

/* copied from Db */
type action('a) =
  | Del(Data.Id.t)
  | Set(Data.Id.t, 'a)
  | SetAll(Data.Id.Map.t('a));

type state('a) = {
  items: Data.Id.Map.t('a),
  dispatch: action('a) => unit,
  loaded: bool,
};

let genericDbReducer = (state, action) => {
  switch (action) {
  | Set(id, item) => state->Map.set(id, item)
  | Del(id) => state->Map.remove(id)
  | SetAll(state) => state
  };
};

type actionConfig =
  | AddAvoidPair(Data.Config.Pair.t)
  | DelAvoidPair(Data.Config.Pair.t)
  | DelAvoidSingle(Data.Id.t)
  | SetAvoidPairs(Data.Config.Pair.Set.t)
  | SetByeValue(Data.Config.ByeValue.t)
  | SetState(Data.Config.t)
  | SetLastBackup(Js.Date.t);

let configReducer = (state, action) => {
  Data.Config.(
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
          ->Set.reduce(Data.Config.Pair.Set.empty, (acc, pair) =>
              if (Data.Config.Pair.has(pair, ~id)) {
                acc;
              } else {
                acc->Set.add(pair);
              }
            ),
      }
    | SetAvoidPairs(avoidPairs) => {...state, avoidPairs}
    | SetByeValue(byeValue) => {...state, byeValue}
    | SetLastBackup(lastBackup) => {...state, lastBackup}
    | SetState(state) => state
    }
  );
};
/* Instead of taking an IndexedDB store as an argument, this takes an object
   with the mocked data. */
let useAllItemsFromDb = data => {
  let (items, dispatch) = React.useReducer(genericDbReducer, data);
  {items, dispatch, loaded: true};
};

let useAllPlayers = () =>
  useAllItemsFromDb(playerData->Data.Id.Map.fromStringArray);

let useAllTournaments = () =>
  useAllItemsFromDb(tournamentData->Data.Id.Map.fromStringArray);

let useConfig = () => React.useReducer(configReducer, configData);
