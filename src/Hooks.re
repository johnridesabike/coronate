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
  type localForageInstance = {
    .
    [@bs.meth] "setItems": Data.db => Js.Promise.t(unit),
    [@bs.meth] "getItem": string => Js.Promise.t(Js.Json.t),
  };
  type localForageType = {
    .
    [@bs.meth] "createInstance": instanceConfig => localForageInstance,
  };

  [@bs.module "localforage"] external localForage: localForageType = "default";
  [%bs.raw {|require("localforage-getitems")|}];
  [@bs.module "localforage-removeitems"]
  external removeItemsPrototype: localForageType => unit = "extendPrototype";
  [@bs.module "localforage-setitems"]
  external setItemsPrototype: localForageType => unit = "extendPrototype";

  /*******************************************************************************
   * Initialize the databases
   ******************************************************************************/
  setItemsPrototype(localForage);
  removeItemsPrototype(localForage);

  let database_name = "Coronate";
  let optionsStore =
    localForage##createInstance({
      "name": database_name,
      "storeName": "Options",
    });
  let playerStore =
    localForage##createInstance({
      "name": database_name,
      "storeName": "Players",
    });
  let tourneyStore =
    localForage##createInstance({
      "name": database_name,
      "storeName": "Tournaments",
    });

  [@bs.deriving abstract]
  type bodyStyleType = {mutable cursor: string};
  [@bs.val] external bodyStyle: bodyStyleType = "document.body.style";
  [@bs.val] [@bs.scope "window"] external alert: string => unit = "alert";
  let loadDemoDB = (_): unit => {
    bodyStyle->cursorSet("wait");
    let _ = Js.Promise.all3((
      optionsStore##setItems(Data.Options(DemoData.options)),
      playerStore##setItems(Data.Players(DemoData.players)),
      tourneyStore##setItems(Data.Tourneys(DemoData.tournaments)),
    ))
    |> Js.Promise.then_(value => {
         alert("Demo data loaded!");
         bodyStyle->cursorSet("auto");
         Js.Promise.resolve(value);
       });
    ();
  };
};

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
//             if (!isLoaded) {