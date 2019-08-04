open Belt;
open Result;

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
  let _: unit = [%bs.raw "document.body.style = \"wait\""];
  /* TODO: waiting for Future to implement `all` */
  Js.Promise.all3((
    ConfigDb.setItems(DemoData.config)->FutureJs.toPromise,
    Players.setItems(DemoData.players)->FutureJs.toPromise,
    Tournaments.setItems(DemoData.tournaments)->FutureJs.toPromise,
  ))
  |> Js.Promise.then_(_ => {
       let _: unit = [%bs.raw "document.body.style = \"auto\""];
       Utils.alert("Demo data loaded!");
       Js.Promise.resolve();
     })
  |> Js.Promise.catch(_ => {
       let _: unit = [%bs.raw "document.body.style = \"auto\""];
       Js.Promise.resolve();
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
let genericDbReducer = (state, action) => {
  switch (action) {
  | SetItem(id, item) => state->Map.String.set(id, item)
  | DelItem(id) => state->Map.String.remove(id)
  | SetState(state) => state
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
    ->Future.map(results =>
        switch (results) {
        | _ when didCancel^ => ()
        /* Even if there was an error, we'll clear the database. This means a
           corrupt database will get wiped. In the future, we may need to
           replace this with more elegant error recovery. */
        | Error () =>
          Externals.LocalForage.clear() |> ignore;
          setIsLoaded(_ => true);
        | Ok(results) =>
          dispatch(SetState(results));
          setIsLoaded(_ => true);
        }
      )
    |> ignore;
    Some(() => didCancel := false);
  });
  /*
    Save items to the database.
   */
  React.useEffect2(
    () => {
      if (isLoaded) {
        setItems(items)
        ->Future.mapOk(() =>
            getKeys()
            ->Future.mapOk(keys => {
                let stateKeys = Map.String.keysToArray(items);
                let deleted =
                  Js.Array.(keys |> filter(x => !(stateKeys |> includes(x))));
                if (Js.Array.length(deleted) > 0) {
                  removeItems(deleted) |> ignore;
                };
              })
            |> ignore
          )
        |> ignore;
      };
      None;
    },
    (items, isLoaded),
  );
  (items, dispatch);
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
    ->Future.map(values =>
        switch (values) {
        | _ when didCancel^ => ()
        | Error(_) =>
          /* Again, if the database was corrupt, then wipe it. */
          Externals.LocalForage.clear() |> ignore;
          setIsLoaded(_ => true);
        | Ok(values) =>
          dispatch(SetState(values));
          setIsLoaded(_ => true);
        }
      )
    |> ignore;
    Some(() => didCancel := true);
  });
  /*
     Save items to the database.
   */
  React.useEffect2(
    () => {
      if (isLoaded) {
        ConfigDb.setItems(config) |> ignore;
      };
      None;
    },
    (config, isLoaded),
  );
  (config, dispatch);
};