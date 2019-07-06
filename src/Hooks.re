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
  type instanceConfig = {
    .
    "name": string,
    "storeName": string,
  };
  type localForageOptions = {
    .
    [@bs.meth] "setItems": Data.Db.options => Js.Promise.t(unit),
    [@bs.meth] "getItem": string => Js.Promise.t(Js.Json.t),
  };
  type localForagePlayers = {
    .
    [@bs.meth] "setItems": Data.Db.players => Js.Promise.t(unit),
    [@bs.meth] "getItem": string => Js.Promise.t(Js.Json.t),
  };
  type localForageTournaments = {
    .
    [@bs.meth] "setItems": Data.Db.tournaments => Js.Promise.t(unit),
    [@bs.meth] "getItem": string => Js.Promise.t(Js.Json.t),
  };
  type localForage = {.};

  [@bs.module "localforage"] external localForage: localForage = "default";
  [@bs.module "localforage"]
  external makeOptionsDb: instanceConfig => localForageOptions =
    "createInstance";
  [@bs.module "localforage"]
  external makePlayersDb: instanceConfig => localForagePlayers =
    "createInstance";
  [@bs.module "localforage"]
  external makeTournamentsDb: instanceConfig => localForageTournaments =
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
    makeOptionsDb({
      "name": database_name,
      "storeName": "Options",
    });
  let playerStore =
    makePlayersDb({
      "name": database_name,
      "storeName": "Players",
    });
  let tourneyStore =
    makeTournamentsDb({
      "name": database_name,
      "storeName": "Tournaments",
    });

  [@bs.deriving abstract]
  type bodyStyleType = {mutable cursor: string};
  [@bs.val] external bodyStyle: bodyStyleType = "document.body.style";
  type testType = {. byeValue: float};
  let loadDemoDB = _: unit => {
    bodyStyle->cursorSet("wait");
    let _ = Js.Promise.all3((
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
} /*             if (!isLoaded) */;

// export async function loadDemoDB() {
//     document.body.style.cursor = "wait";
//     await optionsStore.setItems(demoData.options);
//     await playerStore.setItems(demoData.players);
//     await tourneyStore.setItems(demoData.tournaments);
//     // TODO: for some reason in Electron, this `window.alert()` will disable all
//     // focus after it runs. This affects other `window.alert()`s too.
//     window.alert("Demo data loaded!");
//     document.body.style.cursor = "auto";
// }

// /*******************************************************************************
//  * Generic database hooks
//  ******************************************************************************/
// function useAllItemsFromDb(store, type) {
//     const [items, dispatch] = useReducer(genericDbReducer, {});
//     const [isLoaded, setIsLoaded] = useState(false);
//     useLoadingCursor(isLoaded);
//     useEffect(
//         function loadItemsFromDb() {
//             let didCancel = false;
//             (async function () {
//                 const results = await store.getItems();
//                 // console.log("loaded items from", store.config().storeName);
//                 // TODO: This will silently delete invalid entries from the DB.
//                 // Because invalid entries are typically just older data that
//                 // was created with a different tcomb interface, this should
//                 // ideally update the data to a valid type instead of removing
//                 // it completely.
//                 const cleanResults = results;
//                 Object.entries(cleanResults).forEach(function ([key, value]) {
//                     if (!type.is(value)) {
//                         delete cleanResults[key];
//                     }
//                 });
//                 if (!didCancel) {
//                     dispatch({state: cleanResults, type: "LOAD_STATE"});
//                     setIsLoaded(true);
//                 }
//             }());
//             return function unMount() {
//                 didCancel = true;
//             };
//         },
//         [store, type]
//     );
//     useEffect(
//         function saveChangesToDb() {
//             if (!isLoaded) {
//                 return;
//             }
//             (async function () {
//                 await store.setItems(items);
//                 // console.log("saved items to", store.config().storeName);
//                 const keys = await store.keys();
//                 const stateKeys = Object.keys(items);
//                 const deleted = keys.filter((x) => !stateKeys.includes(x));
//                 if (deleted.length > 0 ) {
//                     await store.removeItems(deleted);
//                     // console.log("Deleted " + deleted.length + " items.");
//                 }
//             }());
//         },
//         [store, items, isLoaded]
//     );
//     return [items, dispatch];
// }

// /*******************************************************************************
//  * Player & tournament wrapper hooks
//  ******************************************************************************/
// export function useAllPlayersDb() {
//     return useAllItemsFromDb(playerStore, types.Player);
// }

// export function useAllTournamentsDb() {
//     return useAllItemsFromDb(tourneyStore, types.Tournament);
// }

// /*******************************************************************************
//  * Options database hooks
//  ******************************************************************************/
// export function useOptionsDb() {
//     const [options, dispatch] = useReducer(optionsReducer, defaultOptions);
//     const [isLoaded, setIsLoaded] = useState(false);
//     useEffect(
//         function initOptionsFromDb() {
//             let didCancel = false;
//             // This uses `iterate` to easily set key-value pairs.
//             optionsStore.iterate(function (value, key) {
//                 if (!didCancel) {
//                     dispatch({option: key, type: "SET_OPTION", value: value});
//                 }
//             }).then(function () {
//                 if (!didCancel) {
//                     setIsLoaded(true);
//                 }
//             });
//             return function unMount() {
//                 didCancel = true;
//             };
//         },
//         []
//     );
//     useEffect(
//         function writeChangesToDb() {