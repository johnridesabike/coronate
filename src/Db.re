open Belt;

/*******************************************************************************
 * Initialize the databases
 ******************************************************************************/
let localForageConfig = LocalForage.LocalForageJs.config(~name="Coronate");
let configDb =
  LocalForage.Record.make(
    localForageConfig(~storeName="Options", ()),
    (module Data.Config),
  );
let players =
  LocalForage.Map.make(
    localForageConfig(~storeName="Players", ()),
    (module Data.Player),
  );
let tournaments =
  LocalForage.Map.make(
    localForageConfig(~storeName="Tournaments", ()),
    (module Data.Tournament),
  );

let loadDemoDB = _: unit => {
  let _: unit = [%bs.raw {|document.body.style.cursor = "wait"|}];
  /* TODO: waiting for Future to implement `all` */
  Js.Promise.all3((
    configDb
    ->LocalForage.Record.set(~items=DemoData.config)
    ->FutureJs.toPromise,
    players
    ->LocalForage.Map.setItems(~items=DemoData.players)
    ->FutureJs.toPromise,
    tournaments
    ->LocalForage.Map.setItems(~items=DemoData.tournaments)
    ->FutureJs.toPromise,
  ))
  |> Js.Promise.then_(_ => {
       let _: unit = [%bs.raw {|document.body.style.cursor = "auto"|}];
       Webapi.(Dom.window |> Dom.Window.alert("Demo data loaded!"));
       Js.Promise.resolve();
     })
  |> Js.Promise.catch(_ => {
       let _: unit = [%bs.raw {|document.body.style.cursor = "auto"|}];
       Js.Promise.resolve();
     })
  |> ignore;
};
/*******************************************************************************
 * Generic database hooks
 ******************************************************************************/
type action('a) =
  | Del(string)
  | Set(string, 'a)
  | SetAll(Map.String.t('a));
let genericDbReducer = (state, action) => {
  switch (action) {
  | Set(id, item) => Map.String.set(state, id, item)
  | Del(id) => Map.String.remove(state, id)
  | SetAll(state) => state
  };
};

let useAllDb = store => {
  let (items, dispatch) =
    React.useReducer(genericDbReducer, Map.String.empty);
  let (isLoaded, setIsLoaded) = React.useState(() => false);
  Hooks.useLoadingCursorUntil(isLoaded);
  /*
    Load items from the database.
   */
  React.useEffect0(() => {
    let didCancel = ref(false);
    LocalForage.Map.getAllItems(store)
    ->Future.tapOk(results =>
        if (! didCancel^) {
          dispatch(SetAll(results));
          setIsLoaded(_ => true);
        }
      )
    ->Future.tapError(_ =>
        if (! didCancel^) {
          /* Even if there was an error, we'll clear the database. This means a
             corrupt database will get wiped. In the future, we may need to
             replace this with more elegant error recovery. */
          LocalForage.LocalForageJs.clear()->ignore;
          setIsLoaded(_ => true);
        }
      )
    ->ignore;
    Some(() => didCancel := true);
  });
  /*
    Save items to the database.
   */
  React.useEffect2(
    () => {
      if (isLoaded) {
        store
        ->LocalForage.Map.setItems(~items)
        /* TODO: This will delete any DB keys that aren't present in the
           state, with the assumption that the state must have intentionally
           removed them. This probably needs to be replaced */
        ->Future.tapOk(() =>
            LocalForage.Map.getKeys(store)
            ->Future.tapOk(keys => {
                let stateKeys = Map.String.keysToArray(items);
                let deleted =
                  Js.Array.(keys |> filter(x => !(stateKeys |> includes(x))));
                if (Js.Array.length(deleted) > 0) {
                  store->LocalForage.Map.removeItems(~items=deleted)->ignore;
                };
              })
            ->ignore
          )
        ->ignore;
      };
      None;
    },
    (items, isLoaded),
  );
  (items, dispatch, isLoaded);
};

let useAllPlayers = () => useAllDb(players);
let useAllTournaments = () => useAllDb(tournaments);

type actionConfig =
  | AddAvoidPair(Data.Config.AvoidPairs.pair)
  | DelAvoidPair(Data.Config.AvoidPairs.pair)
  | DelAvoidSingle(string)
  | SetAvoidPairs(Data.Config.AvoidPairs.t)
  | SetByeValue(Data.Config.ByeValue.t)
  | SetState(Data.Config.t)
  | SetLastBackup(Js.Date.t);

let configReducer = (state, action) => {
  switch (action) {
  | AddAvoidPair(pair) =>
    Data.Config.{...state, avoidPairs: Set.add(state.avoidPairs, pair)}
  | DelAvoidPair(pair) => {
      ...state,
      avoidPairs: Set.remove(state.avoidPairs, pair),
    }
  | DelAvoidSingle(id) => {
      ...state,
      avoidPairs:
        Set.reduce(
          state.avoidPairs, Data.Config.AvoidPairs.empty, (acc, (p1, p2)) =>
          if (p1 === id || p2 === id) {
            acc;
          } else {
            Set.add(acc, (p1, p2));
          }
        ),
    }
  | SetAvoidPairs(avoidPairs) => {...state, avoidPairs}
  | SetByeValue(byeValue) => {...state, byeValue}
  | SetLastBackup(lastBackup) => {...state, lastBackup}
  | SetState(state) => state
  };
};
let useConfig = () => {
  let (config, dispatch) =
    React.useReducer(configReducer, Data.Config.default);
  let (isLoaded, setIsLoaded) = React.useState(() => false);
  /*
     Load items from the database.
   */
  React.useEffect0(() => {
    let didCancel = ref(false);
    LocalForage.Record.get(configDb)
    ->Future.tapOk(values =>
        if (! didCancel^) {
          dispatch(SetState(values));
          setIsLoaded(_ => true);
        }
      )
    ->Future.tapError(_ =>
        if (! didCancel^) {
          LocalForage.LocalForageJs.clear() |> ignore;
          setIsLoaded(_ => true);
        }
      )
    ->ignore;
    Some(() => didCancel := true);
  });
  /*
     Save items to the database.
   */
  React.useEffect2(
    () => {
      if (isLoaded) {
        LocalForage.Record.set(configDb, ~items=config)->ignore;
      };
      None;
    },
    (config, isLoaded),
  );
  (config, dispatch);
};