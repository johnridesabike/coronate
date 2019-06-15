import "localforage-getitems";
import {difference, filter} from "ramda";
import {genericDbReducer, optionsReducer} from "./reducers";
import {useEffect, useReducer, useState} from "react";
import defaultOptions from "./default-options.json";
import demoData from "../demo-data";
import localForage from "localforage";
import {extendPrototype as removeItemsPrototype} from "localforage-removeitems";
import {extendPrototype as setItemsPrototype} from "localforage-setitems";
import {types} from "../data-types";
import {useLoadingCursor} from "./hooks";

/*******************************************************************************
 * Initialize the databases
 ******************************************************************************/
setItemsPrototype(localForage);
removeItemsPrototype(localForage);
const DATABASE_NAME = "Chessahoochee";
const optionsStore = localForage.createInstance({
    name: DATABASE_NAME,
    storeName: "Options"
});
const playerStore = localForage.createInstance({
    name: DATABASE_NAME,
    storeName: "Players"
});
const tourneyStore = localForage.createInstance({
    name: DATABASE_NAME,
    storeName: "Tournaments"
});

export {optionsStore, playerStore, tourneyStore};

export async function loadDemoDB() {
    document.body.style.cursor = "wait";
    await optionsStore.setItems(demoData.options);
    await playerStore.setItems(demoData.players);
    await tourneyStore.setItems(demoData.tournaments);
    // TODO: for some reason in Electron, this `window.alert()` will disable all
    // focus after it runs. This affects other `window.alert()`s too.
    window.alert("Demo data loaded!");
    document.body.style.cursor = "auto";
}

/*******************************************************************************
 * Generic database hooks
 ******************************************************************************/
function useAllItemsFromDb(store, type) {
    const [items, dispatch] = useReducer(genericDbReducer, {});
    const [isLoaded, setIsLoaded] = useState(false);
    useLoadingCursor(isLoaded);
    useEffect(
        function loadItemsFromDb() {
            let didCancel = false;
            (async function () {
                const results = await store.getItems();
                console.log("loaded items from", store._config.storeName);
                // TODO: This will silently delete invalid entries from the DB.
                // Because invalid entries are typically just older data that
                // was created with a different tcomb interface, this should
                // ideally update the data to a valid type instead of removing
                // it completely.
                const cleanResults =  filter(type.is, results);
                if (!didCancel) {
                    dispatch({state: cleanResults, type: "LOAD_STATE"});
                    setIsLoaded(true);
                }
            }());
            return function unMount() {
                didCancel = true;
            };
        },
        [store, type]
    );
    useEffect(
        function saveChangesToDb() {
            if (!isLoaded) {
                return;
            }
            (async function () {
                await store.setItems(items);
                console.log("saved items to", store._config.storeName);
                const keys = await store.keys();
                const deleted = difference(keys, Object.keys(items));
                if (deleted.length > 0 ) {
                    await store.removeItems(deleted);
                    console.log("Deleted " + deleted.length + " items.");
                }
            }());
        },
        [store, items, isLoaded]
    );
    return [items, dispatch];
}

/*******************************************************************************
 * Player & tournament wrapper hooks
 ******************************************************************************/
export function useAllPlayersDb() {
    return useAllItemsFromDb(playerStore, types.Player);
}

export function useAllTournamentsDb() {
    return useAllItemsFromDb(tourneyStore, types.Tournament);
}

/*******************************************************************************
 * Options database hooks
 ******************************************************************************/
export function useOptionsDb() {
    const [options, dispatch] = useReducer(optionsReducer, defaultOptions);
    const [isLoaded, setIsLoaded] = useState(false);
    useEffect(
        function initOptionsFromDb() {
            let didCancel = false;
            // This uses `iterate` to easily set key-value pairs.
            optionsStore.iterate(function (value, key) {
                if (!didCancel) {
                    dispatch({option: key, type: "SET_OPTION", value: value});
                }
            }).then(function () {
                if (!didCancel) {
                    setIsLoaded(true);
                }
            });
            return function unMount() {
                didCancel = true;
            };
        },
        []
    );
    useEffect(
        function writeChangesToDb() {
            if (!isLoaded) {
                return;
            }
            optionsStore.setItems(options);
        },
        [options, isLoaded]
    );
    return [options, dispatch];
}
