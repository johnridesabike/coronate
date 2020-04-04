open Belt;

/*******************************************************************************
 * Initialize the databases
 ******************************************************************************/
let localForageConfig = LocalForage.Config.make(~name="Coronate");
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
  Js.Promise.all3((
    LocalForage.Record.set(configDb, ~items=DemoData.config),
    LocalForage.Map.setItems(players, ~items=DemoData.players),
    LocalForage.Map.setItems(tournaments, ~items=DemoData.tournaments),
  ))
  ->Promise.Js.fromBsPromise
  ->Promise.Js.catch(_ => {
      let _: unit = [%bs.raw {|document.body.style.cursor = "auto"|}];
      Js.Console.error("Couldn't load demo data.");
      Promise.resolved(((), (), ()));
    })
  ->Promise.get(_ => {
      let _: unit = [%bs.raw {|document.body.style.cursor = "auto"|}];
      Utils.alert("Demo data loaded!");
    });
};
/*******************************************************************************
 * Generic database hooks
 ******************************************************************************/
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
  | Set(id, item) => Map.set(state, id, item)
  | Del(id) => Map.remove(state, id)
  | SetAll(state) => state
  };
};

let useAllDb = store => {
  let (items, dispatch) =
    React.useReducer(genericDbReducer, Data.Id.Map.make());
  let (loaded, setLoaded) = React.useState(() => false);
  Hooks.useLoadingCursorUntil(loaded);
  /*
    Load items from the database.
   */
  React.useEffect0(() => {
    let didCancel = ref(false);
    LocalForage.Map.getAllItems(store)
    ->Promise.Js.fromBsPromise
    ->Promise.Js.toResult
    ->Promise.tapOk(results =>
        if (! didCancel^) {
          dispatch(SetAll(results->Data.Id.Map.fromStringArray));
          setLoaded(_ => true);
        }
      )
    ->Promise.getError(error =>
        if (! didCancel^) {
          /* Even if there was an error, we'll clear the database. This means a
             corrupt database will get wiped. In the future, we may need to
             replace this with more elegant error recovery. */
          Js.Console.error(error);
          ()->LocalForage.LocalForageJs.clear->ignore;
          setLoaded(_ => true);
        }
      );
    Some(() => didCancel := true);
  });
  /*
    Save items to the database.
   */
  React.useEffect2(
    () => {
      if (loaded) {
        store
        ->LocalForage.Map.setItems(~items=items->Data.Id.Map.toStringArray)
        ->Promise.Js.fromBsPromise
        ->Promise.Js.toResult
        /* TODO: This will delete any DB keys that aren't present in the
           state, with the assumption that the state must have intentionally
           removed them. This probably needs to be replaced */
        ->Promise.getOk(() =>
            LocalForage.Map.getKeys(store)
            ->Promise.Js.fromBsPromise
            ->Promise.Js.toResult
            ->Promise.getOk(keys => {
                let stateKeys = Map.keysToArray(items);
                let deleted =
                  Js.Array2.(
                    filter(keys, x =>
                      !includes(stateKeys, x->Data.Id.fromString)
                    )
                  );
                if (Array.size(deleted) > 0) {
                  LocalForage.Map.removeItems(store, ~items=deleted)->ignore;
                };
              })
          );
      };
      None;
    },
    (items, loaded),
  );
  {items, dispatch, loaded};
};

let useAllPlayers = () => useAllDb(players);

let useAllTournaments = () => useAllDb(tournaments);

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
        avoidPairs:
          Set.reduce(state.avoidPairs, Pair.Set.empty, (acc, pair) =>
            if (Pair.has(pair, ~id)) {
              acc;
            } else {
              Set.add(acc, pair);
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

let useConfig = () => {
  let (config, dispatch) =
    React.useReducer(configReducer, Data.Config.default);
  let (isLoaded, setIsLoaded) = React.useState(() => false);
  /* Load items from the database. */
  React.useEffect0(() => {
    let didCancel = ref(false);
    LocalForage.Record.get(configDb)
    ->Promise.Js.fromBsPromise
    ->Promise.Js.toResult
    ->Promise.tapOk(values =>
        if (! didCancel^) {
          dispatch(SetState(values));
          setIsLoaded(_ => true);
        }
      )
    ->Promise.getError(_ =>
        if (! didCancel^) {
          ()->LocalForage.LocalForageJs.clear->ignore;
          dispatch(SetState(Data.Config.default));
          setIsLoaded(_ => true);
        }
      );
    Some(() => didCancel := true);
  });
  /* Save items to the database. */
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
