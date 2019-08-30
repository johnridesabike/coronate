open Belt;

/*******************************************************************************
 * Initialize the databases
 ******************************************************************************/
let database_name = "Coronate";
module ConfigDb =
  Externals.LocalForage.Object(
    Data.Config,
    {
      let name = database_name;
      let storeName = "Options";
      let default = Data.Config.defaults;
    },
  );
module Players =
  Externals.LocalForage.Map(
    Data.Player,
    {
      let name = database_name;
      let storeName = "Players";
    },
  );
module Tournaments =
  Externals.LocalForage.Map(
    Data.Tournament,
    {
      let name = database_name;
      let storeName = "Tournaments";
    },
  );

let loadDemoDB = _: unit => {
  let _: unit = [%bs.raw {|document.body.style.cursor = "wait"|}];
  /* TODO: waiting for Future to implement `all` */
  Js.Promise.all3((
    ConfigDb.setItems(DemoData.config)->FutureJs.toPromise,
    Players.setItems(DemoData.players)->FutureJs.toPromise,
    Tournaments.setItems(DemoData.tournaments)->FutureJs.toPromise,
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
  | Set(id, item) => state->Map.String.set(id, item)
  | Del(id) => state->Map.String.remove(id)
  | SetAll(state) => state
  };
};

let useAllDb = (~getAllItems, ~setItems, ~removeItems, ~getKeys, ()) => {
  let (items, dispatch) =
    React.useReducer(genericDbReducer, Map.String.empty);
  let (isLoaded, setIsLoaded) = React.useState(() => false);
  Hooks.useLoadingCursorUntil(isLoaded);
  /*
    Load items from the database.
   */
  React.useEffect0(() => {
    let didCancel = ref(false);
    getAllItems()
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
          Externals.LocalForage.clear()->ignore;
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
        setItems(items)
        /* TODO: This will delete any DB keys that aren't present in the
           state, with the assumption that the state must have intentionally
           removed them. This probably needs to be replaced */
        ->Future.tapOk(() =>
            getKeys()
            ->Future.tapOk(keys => {
                let stateKeys = Map.String.keysToArray(items);
                let deleted =
                  Js.Array.(keys |> filter(x => !(stateKeys |> includes(x))));
                if (Js.Array.length(deleted) > 0) {
                  removeItems(deleted)->ignore;
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

let useAllPlayers =
  useAllDb(
    ~getAllItems=Players.getAllItems,
    ~setItems=Players.setItems,
    ~removeItems=Players.removeItems,
    ~getKeys=Players.getKeys,
  );
let useAllTournaments =
  useAllDb(
    ~getAllItems=Tournaments.getAllItems,
    ~setItems=Tournaments.setItems,
    ~removeItems=Tournaments.removeItems,
    ~getKeys=Tournaments.getKeys,
  );

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
let useConfig = () => {
  let (config, dispatch) = React.useReducer(configReducer, ConfigDb.default);
  let (isLoaded, setIsLoaded) = React.useState(() => false);
  /*
     Load items from the database.
   */
  React.useEffect0(() => {
    let didCancel = ref(false);
    ConfigDb.getItems()
    ->Future.tapOk(values =>
        if (! didCancel^) {
          dispatch(SetState(values));
          setIsLoaded(_ => true);
        }
      )
    ->Future.tapError(_ =>
        if (! didCancel^) {
          Externals.LocalForage.clear() |> ignore;
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
        ConfigDb.setItems(config)->ignore;
      };
      None;
    },
    (config, isLoaded),
  );
  (config, dispatch);
};