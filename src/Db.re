open Belt;
module LocalForage = Externals.LocalForage;

/*******************************************************************************
 * Initialize the databases
 ******************************************************************************/
let database_name = "Coronate";
module ConfigDb =
  LocalForage.Object(
    Data.Config,
    {
      let name = database_name;
      let storeName = "Options";
    },
  );
module Players =
  LocalForage.Map(
    Data.Player,
    {
      let name = database_name;
      let storeName = "Players";
    },
  );
module Tournaments =
  LocalForage.Map(
    Data.Tournament,
    {
      let name = database_name;
      let storeName = "Tournaments";
    },
  );

let loadDemoDB = _: unit => {
  let _: unit = [%bs.raw "document.body.style = \"wait\""];
  Repromise.all3(
    ConfigDb.setItems(DemoData.config),
    Players.setItems(DemoData.players),
    Tournaments.setItems(DemoData.tournaments),
  )
  |> Repromise.map(_ => {
       let _: unit = [%bs.raw "document.body.style = \"auto\""];
       Utils.alert("Demo data loaded!");
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
let genericDbReducer = (state, action) => {
  switch (action) {
  | SetItem(id, item) => state->Map.String.set(id, item)
  | DelItem(id) => state->Map.String.remove(id)
  | SetState(state) => state
  };
};

type loadStatus =
  | IsNotLoaded
  | IsLoaded
  | Error;

let isLoaded = status =>
  switch (status) {
  | IsNotLoaded => false
  | IsLoaded
  | Error => true
  };

let useAllDb = (~getAllItems, ~setItems, ~removeItems, ~getKeys, ()) => {
  let (items, dispatch) =
    React.useReducer(genericDbReducer, Map.String.empty);
  let (loadStatus, setLoadStatus) = React.useState(() => IsNotLoaded);
  Hooks.useLoadingCursorUntil(isLoaded(loadStatus));
  React.useEffect0(() => {
    let didCancel = ref(false);
    getAllItems()
    |> Repromise.map(results =>
         switch (results) {
         | Result.Error(_) => setLoadStatus(_ => Error)
         | Ok(_) when didCancel^ => ()
         | Ok(results) =>
           dispatch(SetState(results));
           setLoadStatus(_ => IsLoaded);
         }
       )
    |> ignore;
    Some(() => didCancel := false);
  });
  React.useEffect2(
    () =>
      switch (loadStatus) {
      | IsNotLoaded
      | Error => None
      | IsLoaded =>
        setItems(items)
        |> Repromise.map(() =>
             getKeys()
             |> Repromise.map(keys => {
                  let stateKeys = items->Map.String.keysToArray;
                  let deleted =
                    Js.Array.(
                      keys |> filter(x => !(stateKeys |> includes(x)))
                    );
                  if (deleted |> Js.Array.length > 0) {
                    removeItems(deleted) |> ignore;
                  };
                })
             |> ignore
           )
        |> ignore;
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
  | AddAvoidPair(Data.AvoidPairs.pair)
  | DelAvoidPair(Data.AvoidPairs.pair)
  | DelAvoidSingle(string)
  | SetAvoidPairs(Data.AvoidPairs.t)
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
        ->Set.reduce(Data.AvoidPairs.make(), (acc, (p1, p2)) =>
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
  let (config, dispatch) =
    React.useReducer(configReducer, Data.Config.defaults);
  let (isLoaded, setIsLoaded) = React.useState(() => false);
  React.useEffect2(
    () => {
      let didCancel = ref(false);
      ConfigDb.getItems()
      |> Repromise.map(values =>
           switch (values) {
           | Result.Error(_) => ()
           | Result.Ok(_) when didCancel^ => ()
           | Result.Ok(values) =>
             dispatch(SetAvoidPairs(values.Data.Config.avoidPairs));
             dispatch(SetByeValue(values.byeValue));
             dispatch(SetLastBackup(values.lastBackup));
             setIsLoaded(_ => true);
           }
         )
      |> ignore;
      Some(() => didCancel := true);
    },
    (setIsLoaded, dispatch),
  );
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