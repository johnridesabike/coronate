// import "localforage-getitems";
// import {genericDbReducer, optionsReducer} from "./reducers";
// import {useEffect, useReducer, useState} from "react";
// import defaultOptions from "./default-options";
// import demoData from "../demo-data";
// import localForage from "localforage";
// import {extendPrototype as removeItemsPrototype} from "localforage-removeitems";
// import {extendPrototype as setItemsPrototype} from "localforage-setitems";
// import {types} from "../data-types";
// import {useLoadingCursor} from "./hooks";
module Db = {
  open Data;
  type instanceConfig = {
    .
    "name": string,
    "storeName": string,
  };
  type localForageInstance('a) = {
    .
    [@bs.meth] "setItems": Js.Dict.t('a) => Js.Promise.t(unit),
    [@bs.meth] "getItem": string => Js.Promise.t('a),
  };
  type localForageOptions = {
    .
    [@bs.meth] "setItems": db_options => Js.Promise.t(unit),
    [@bs.meth] "getItem": string => Js.Promise.t(db_options),
  };
  type localForage = {.};

  [@bs.module "localforage"] external localForage: localForage = "default";
  [@bs.module "localforage"]
  external makeOptionsDb: instanceConfig => localForageOptions =
    "createInstance";
  [@bs.module "localforage"]
  external makePlayersDb: instanceConfig => localForageInstance(Player.t) =
    "createInstance";
  [@bs.module "localforage"]
  external makeTournamentsDb:
    instanceConfig => localForageInstance(Tournament.t) =
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

  [@bs.deriving abstract]
  type bodyStyleType = {mutable cursor: string};
  [@bs.val] external bodyStyle: bodyStyleType = "document.body.style";
  type testType = {. byeValue: float};
  let loadDemoDB = _: unit => {
    bodyStyle->cursorSet("wait");
    let _ =
      Js.Promise.all3((
        optionsStore##setItems(DemoData.options),
        playerStore##setItems(DemoData.players),
        tourneyStore##setItems(DemoData.tournaments),
      ))
      |> Js.Promise.then_(value => {
           Utils.alert("Demo data loaded!");
           bodyStyle->cursorSet("auto");
           Js.Promise.resolve(value);
         });
    ();
  };
  /*******************************************************************************
   * Generic database hooks
   ******************************************************************************/
  type actionTourney = | AddTourney(Tournament.t);
  let allTournamentsReducer = (state, action) => {
    switch action {
    | AddTourney(tourney) => state->Belt.Map.String.set(tourney->Tournament.idGet, tourney)
    }
  };
  let testreducer = (a, b) => b;
  let useAllItemsFromDb = store => {
    let (items, dispatch) = React.useReducer(testreducer, Belt.Map.String.empty);
    let (isLoaded, setIsLoaded) = React.useState(() => false);
    // useLoadingCursor(isLoaded);
    React.useEffect3(
      () => {
        let didCancel = ref(false);
        let _ =
          store##getItems()
          |> Js.Promise.then_(results => {
               if (! didCancel^) {
                 dispatch(results);
                 // dispatch({state: cleanResults, type: "LOAD_STATE"});
                 setIsLoaded(_ => true);
               };
               Js.Promise.resolve(results);
             });
        Some(() => didCancel := false);
      },
      (store, dispatch, setIsLoaded),
    );
    // useEffect(
    //     function saveChangesToDb() {
    //         if (!isLoaded) {
    //             return;
    //         }
    //         (async function () {
    //             await store.setItems(items);
    //             // console.log("saved items to", store.config().storeName);
    //             const keys = await store.keys();
    //             const stateKeys = Object.keys(items);
    //             const deleted = keys.filter((x) => !stateKeys.includes(x));
    //             if (deleted.length > 0 ) {
    //                 await store.removeItems(deleted);
    //                 // console.log("Deleted " + deleted.length + " items.");
    //             }
    //         }());
    //     },
    //     [store, items, isLoaded]
    // );
    // return [items, dispatch];
  };
};