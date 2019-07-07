module Map = Belt.Map.String;

type keyFunc('a) =
  | KeyString('a => string)
  | KeyInt('a => int)
  | KeyFloat('a => float)
  | KeyDate('a => Js.Date.t);

type tableState('a) = {
  isDescending: bool,
  key: keyFunc('a),
  table: Js.Array.t('a),
};

type actionTable('a) =
  | SetIsDescending(bool)
  | SetKey(keyFunc('a))
  | SetTable(Js.Array.t('a))
  | SortWithoutUpdating;

let sortedTableReducer = (state, action) => {
  let newState =
    switch (action) {
    | SetTable(table) => {...state, table}
    | SetIsDescending(isDescending) => {...state, isDescending}
    | SetKey(key) => {...state, key}
    | SortWithoutUpdating => state
    };
  let direction = newState.isDescending ? Utils.descend : Utils.ascend;
  let sortFunc =
    switch (newState.key) {
    | KeyString(func) =>
      (str => str |> func |> Js.String.toLowerCase) |> direction
    | KeyInt(func) => func |> direction
    | KeyFloat(func) => func |> direction
    | KeyDate(func) => func |> direction
    };
  let table = newState.table->Belt.SortArray.stableSortBy(sortFunc);
  {...newState, table};
};

let useSortedTable = (~table, ~key, ~isDescending) => {
  let initialState = {table, key, isDescending};
  let (state, dispatch) = React.useReducer(sortedTableReducer, initialState);
  React.useEffect0(() => {
    dispatch(SortWithoutUpdating);
    None;
  });
  (state, dispatch);
};

let useLoadingCursor = isLoaded => {
  React.useEffect1(
    () => {
      let _ =
        isLoaded
          ? [%bs.raw "document.body.style.cursor = \"auto\""]
          : [%bs.raw "document.body.style.cursor = \"wait\""];
      let reset = () => [%bs.raw "document.body.style.cursor = \"auto\""];
      Some(reset);
    },
    [|isLoaded|],
  );
};

module Db = {
  open Data;
  type actionOption =
    | AddAvoidPair(Data.avoidPair)
    | DelAvoidPair(Data.avoidPair)
    | DelAvoidSingle(string)
    | SetAvoidPairs(array(avoidPair))
    | SetByeValue(float)
    | SetLastBackup(Js.Date.t);
  type instanceConfig = {
    .
    "name": string,
    "storeName": string,
  };
  type loFoInstance('a) = {
    .
    [@bs.meth] "getItem": string => Js.Promise.t('a),
    [@bs.meth] "setItems": Js.Dict.t('a) => Js.Promise.t(unit),
    [@bs.meth] "getItems": unit => Js.Promise.t(Js.Dict.t('a)),
    [@bs.meth] "deleteItems": array(string) => Js.Promise.t(unit),
    [@bs.meth] "keys": unit => Js.Promise.t(Js.Array.t(string)),
  };
  type localForageOptions = {
    .
    [@bs.meth] "setItems": db_options => Js.Promise.t(unit),
    [@bs.meth] "getItems": unit => Js.Promise.t(db_options),
  };
  type localForage = {.};

  [@bs.module "localforage"] external localForage: localForage = "default";
  [@bs.module "localforage"]
  external makeOptionsDb: instanceConfig => localForageOptions =
    "createInstance";
  [@bs.module "localforage"]
  external makePlayersDb: instanceConfig => loFoInstance(Player.t) =
    "createInstance";
  [@bs.module "localforage"]
  external makeTournamentsDb: instanceConfig => loFoInstance(Tournament.t) =
    "createInstance";
  /*
   These only need to be done once to extend the JS localforage module:
   */
  [%bs.raw {|require("localforage-getitems")|}];
  [@bs.module "localforage-removeitems"]
  external removeItemsPrototype: localForage => unit = "extendPrototype";
  [@bs.module "localforage-setitems"]
  external setItemsPrototype: localForage => unit = "extendPrototype";
  setItemsPrototype(localForage);
  removeItemsPrototype(localForage);

  /*******************************************************************************
   * Initialize the databases
   ******************************************************************************/

  let database_name = "Coronate";
  let optionsStore =
    makeOptionsDb({"name": database_name, "storeName": "Options"});
  let playerStore =
    makePlayersDb({"name": database_name, "storeName": "Players"});
  let tourneyStore =
    makeTournamentsDb({"name": database_name, "storeName": "Tournaments"});

  type testType = {. byeValue: float};
  let loadDemoDB = _: unit => {
    let _: unit = [%bs.raw "document.body.style = \"wait\""];
    let _ =
      Js.Promise.all3((
        optionsStore##setItems(DemoData.options),
        playerStore##setItems(DemoData.players),
        tourneyStore##setItems(DemoData.tournaments),
      ))
      |> Js.Promise.then_(value => {
           Utils.alert("Demo data loaded!");
           let _: unit = [%bs.raw "document.body.style = \"auto\""];
           Js.Promise.resolve(value);
         })
      |> Js.Promise.catch(_ => {
           let _: unit = [%bs.raw "document.body.style = \"auto\""];
           Js.Promise.resolve(((), (), ()));
         });
    ();
  };
  /*******************************************************************************
   * Generic database hooks
   ******************************************************************************/
  type actionDb('a) =
    | AddItem(string, 'a)
    | DelItem(string)
    | SetState(Map.t('a));
  type genericReducer('a) = (Map.t('a), actionDb('a)) => Map.t('a);
  let genericDbReducer = (state, action) => {
    switch (action) {
    | AddItem(id, item) => state->Map.set(id, item)
    | DelItem(id) => state->Map.remove(id)
    | SetState(state) => state
    };
  };
  let useAllItemsFromDb =
      (store: loFoInstance('a), reducer: genericReducer('a)) => {
    let (items, dispatch) = React.useReducer(reducer, Belt.Map.String.empty);
    let (isLoaded, setIsLoaded) = React.useState(() => false);
    useLoadingCursor(isLoaded);
    React.useEffect3(
      () => {
        let didCancel = ref(false);
        let _ =
          store##getItems()
          |> Js.Promise.then_(results => {
               if (! didCancel^) {
                 dispatch(SetState(results |> Utils.dictToMap));
                 setIsLoaded(_ => true);
               };
               Js.Promise.resolve(results);
             });
        Some(() => didCancel := false);
      },
      (store, dispatch, setIsLoaded),
    );
    React.useEffect3(
      () =>
        switch (isLoaded) {
        | false => None
        | true =>
          let _ =
            store##setItems(items |> Utils.mapToDict)
            |> Js.Promise.then_(() => {
                 let _ =
                   store##keys()
                   |> Js.Promise.then_(keys => {
                        let stateKeys = items->Map.keysToArray;
                        let deleted =
                          keys
                          |> Js.Array.filter(x =>
                               !(stateKeys |> Js.Array.includes(x))
                             );
                        if (deleted |> Js.Array.length > 0) {
                          let _ = store##deleteItems(deleted);
                          ();
                        };
                        Js.Promise.resolve();
                      });
                 Js.Promise.resolve();
               });
          None;
        },
      (store, items, isLoaded),
    );
    (items, dispatch);
  };
  let useAllPlayers = () => useAllItemsFromDb(playerStore, genericDbReducer);
  let useAllTournaments = () =>
    useAllItemsFromDb(tourneyStore, genericDbReducer);
  let optionsReducer = (state, action) => {
    let avoidPairs = state->avoidPairsGet;
    let byeValue = state->byeValueGet;
    let lastBackup = state->lastBackupGet;
    Js.Array.(
      switch (action) {
      | AddAvoidPair(pair) =>
        db_options(
          ~avoidPairs=state |> avoidPairsGet |> concat([|pair|]),
          ~byeValue,
          ~lastBackup,
        )
      | DelAvoidPair((user1, user2)) =>
        db_options(
          ~avoidPairs=
            state
            |> avoidPairsGet
            |> filter(((p1, p2)) =>
                 !(
                   [|p1, p2|]
                   |> includes(user1)
                   && [|p1, p2|]
                   |> includes(user2)
                 )
               ),
          ~byeValue,
          ~lastBackup,
        )
      | DelAvoidSingle(id) =>
        db_options(
          ~avoidPairs=
            state
            |> avoidPairsGet
            |> filter(((p1, p2)) => !([|p1, p2|] |> includes(id))),
          ~byeValue,
          ~lastBackup,
        )
      | SetAvoidPairs(avoidPairs) =>
        db_options(~avoidPairs, ~byeValue, ~lastBackup)
      | SetByeValue(value) =>
        db_options(~avoidPairs, ~byeValue=value, ~lastBackup)
      | SetLastBackup(date) =>
        db_options(~avoidPairs, ~byeValue, ~lastBackup=date)
      }
    );
  };
  let useOptionsDb = () => {
    let (options, dispatch) =
      React.useReducer(optionsReducer, defaultOptions);
    let (isLoaded, setIsLoaded) = React.useState(() => false);
    React.useEffect0(() => {
      let didCancel = ref(false);
      let _ =
        optionsStore##getItems()
        |> Js.Promise.then_(values => {
             if (! didCancel^) {
               dispatch(SetAvoidPairs(values->avoidPairsGet));
               dispatch(SetByeValue(values->byeValueGet));
               dispatch(SetLastBackup(values->lastBackupGet));
               setIsLoaded(_ => true);
             };
             Js.Promise.resolve();
           });
      Some(() => didCancel := true);
    });
    React.useEffect2(
      () =>
        switch (isLoaded) {
        | false => None
        | true =>
          let _ = optionsStore##setItems(options);
          None;
        },
      (options, isLoaded),
    );
    (options, dispatch);
  };
};