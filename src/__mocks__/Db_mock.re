open Belt;
open TestData;
let configData = {
  ...config,
  avoidPairs:
    config.avoidPairs |> Js.Array.concat(DemoData.config.avoidPairs),
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

type actionOption =
  | AddAvoidPair(Data.Config.avoidPair)
  | DelAvoidPair(Data.Config.avoidPair)
  | DelAvoidSingle(string)
  | SetAvoidPairs(array(Data.Config.avoidPair))
  | SetByeValue(Data.ByeValue.t)
  | SetState(Data.Config.t)
  | SetLastBackup(Js.Date.t);

let configReducer = (state: Data.Config.t, action) => {
  Js.Array.(
    switch (action) {
    | AddAvoidPair(pair) => {
        ...state,
        avoidPairs: state.avoidPairs |> concat([|pair|]),
      }
    | DelAvoidPair((user1, user2)) => {
        ...state,
        avoidPairs:
          state.avoidPairs
          |> filter(((p1, p2)) =>
               !(
                 [|p1, p2|]
                 |> includes(user1)
                 && [|p1, p2|]
                 |> includes(user2)
               )
             ),
      }
    | DelAvoidSingle(id) => {
        ...state,
        avoidPairs:
          state.avoidPairs
          |> filter(((p1, p2)) => !([|p1, p2|] |> includes(id))),
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
let useAllItemsFromDb = data => React.useReducer(genericDbReducer, data);
let useAllPlayers = () => useAllItemsFromDb(playerData);
let useAllTournaments = () => useAllItemsFromDb(tournaments);
let useConfig = () => React.useReducer(configReducer, configData);