open Belt;
open Data;
module LocalForage = Externals.LocalForage;

/*******************************************************************************
 * Initialize the databases
 ******************************************************************************/
let database_name = "Coronate";
module ConfigDb = LocalForage.Obj.Instance(Data.Config);
let configStore = ConfigDb.make(~name=database_name, ~storeName="Options");
module Players = LocalForage.Map.Instance(Player);
let playerStore = Players.make(~name=database_name, ~storeName="Players");
module Tournaments = LocalForage.Map.Instance(Tournament);
let tourneyStore =
  Tournaments.make(~name=database_name, ~storeName="Tournaments");

let jsDictToReMap = (dict, transformer) =>
  dict
  |> Js.Dict.entries
  |> Js.Array.map(((key, value)) => (key, value |> transformer))
  |> Map.String.fromArray;
let reMapToJsDict = (map, transformer) =>
  map->Map.String.toArray
  |> Js.Array.map(((key, value)) => (key, value |> transformer))
  |> Js.Dict.fromArray;

type testType = {. byeValue: float};
let loadDemoDB = _: unit => {
  let _: unit = [%bs.raw "document.body.style = \"wait\""];
  Repromise.all3(
    configStore->LocalForage.Obj.setItems(DemoData.config |> Config.tToJs),
    playerStore->LocalForage.Map.setItems(
      DemoData.players->reMapToJsDict(Data.Player.tToJs),
    ),
    tourneyStore->LocalForage.Map.setItems(
      DemoData.tournaments->reMapToJsDict(Data.Tournament.tToJsDeep),
    ),
  )
  |> Repromise.map(_ => {
       Utils.alert("Demo data loaded!");
       let _: unit = [%bs.raw "document.body.style = \"auto\""];
       ();
     })
  |> Repromise.Rejectable.catch(_ => {
       let _: unit = [%bs.raw "document.body.style = \"auto\""];
       Repromise.resolved();
     })
  |> ignore;
};
/*******************************************************************************
 * Generic database hooks
 ******************************************************************************/
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
let useAllItemsFromDb =
    (
      ~store: LocalForage.Map.t('js),
      ~reducer: genericReducer('re),
      ~fromJs: 'js => 're,
      ~toJs: 're => 'js,
    ) => {
  let (items, dispatch) = React.useReducer(reducer, Map.String.empty);
  let (isLoaded, setIsLoaded) = React.useState(() => false);
  Hooks.useLoadingCursorUntil(isLoaded);
  React.useEffect4(
    () => {
      let didCancel = ref(false);
      store->LocalForage.Map.getItems(Js.Nullable.null)
      |> Repromise.map(results =>
           if (! didCancel^) {
             dispatch(SetState(results->jsDictToReMap(fromJs)));
             setIsLoaded(_ => true);
           }
         )
      |> ignore;

      Some(() => didCancel := false);
    },
    (store, dispatch, setIsLoaded, fromJs),
  );
  React.useEffect4(
    () =>
      switch (isLoaded) {
      | false => None
      | true =>
        store->LocalForage.Map.setItems(items->reMapToJsDict(toJs))
        |> Repromise.map(() =>
             store->LocalForage.Map.keys()
             |> Repromise.map(keys => {
                  let stateKeys = items->Map.String.keysToArray;
                  let deleted =
                    Js.Array.(
                      keys |> filter(x => !(stateKeys |> includes(x)))
                    );
                  if (deleted |> Js.Array.length > 0) {
                    store->LocalForage.Map.removeItems(deleted) |> ignore;
                  };
                })
             |> ignore
           )
        |> ignore;
        None;
      },
    (store, items, isLoaded, toJs),
  );
  (items, dispatch);
};

let useAllPlayers = () =>
  useAllItemsFromDb(
    ~store=playerStore,
    ~reducer=genericDbReducer,
    ~fromJs=Data.Player.tFromJs,
    ~toJs=Data.Player.tToJs,
  );

let useAllTournaments = () =>
  useAllItemsFromDb(
    ~store=tourneyStore,
    ~reducer=genericDbReducer,
    ~fromJs=Data.Tournament.tFromJsDeep,
    ~toJs=Data.Tournament.tToJsDeep,
  );

type actionOption =
  | AddAvoidPair(Data.avoidPair)
  | DelAvoidPair(Data.avoidPair)
  | DelAvoidSingle(string)
  | SetAvoidPairs(array(avoidPair))
  | SetByeValue(float)
  | SetState(Config.t)
  | SetLastBackup(Js.Date.t);

let configReducer = (state: Config.t, action) => {
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
let useConfig = () => {
  let (config, dispatch) = React.useReducer(configReducer, Config.defaults);
  let (isLoaded, setIsLoaded) = React.useState(() => false);
  React.useEffect2(
    () => {
      let didCancel = ref(false);
      configStore->LocalForage.Obj.getItems(Js.Nullable.null)
      |> Repromise.map(valuesJs => {
           let values = Config.tFromJs(valuesJs);
           if (! didCancel^) {
             dispatch(SetAvoidPairs(values.avoidPairs));
             dispatch(SetByeValue(values.byeValue));
             dispatch(SetLastBackup(values.lastBackup));
             setIsLoaded(_ => true);
           };
         })
      |> ignore;

      Some(() => didCancel := true);
    },
    (setIsLoaded, dispatch),
  );
  React.useEffect2(
    () =>
      switch (isLoaded) {
      | false => None
      | true =>
        configStore->LocalForage.Obj.setItems(config |> Config.tToJs)
        |> ignore;
        None;
      },
    (config, isLoaded),
  );
  (config, dispatch);
};