import "localforage-getitems";
import {genericDbReducer, optionsReducer} from "./reducers";
import {useEffect, useReducer, useState} from "react";
import demoData from "../demo-data";
import {difference} from "ramda";
import localForage from "localforage";
import {extendPrototype as removeItemsPrototype} from "localforage-removeitems";
import {extendPrototype as setItemsPrototype} from "localforage-setitems";

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

export function loadDemoDB() {
    optionsStore.setItems(demoData.options);
    playerStore.setItems(demoData.players);
    tourneyStore.setItems(demoData.tournaments);
    window.alert("Demo data loaded!");
}

/*******************************************************************************
 * Generic database hooks
 ******************************************************************************/
function useAllItemsFromDb(store) {
    const [items, dispatch] = useReducer(genericDbReducer, {});
    const [isLoaded, setIsLoaded] = useState(false);
    useEffect(
        function loadItemsFromDb() {
            store.getItems().then(function (results) {
                console.log("loaded items from", store._config.storeName);
                dispatch({state: results, type: "LOAD_STATE"});
                setIsLoaded(true);
            });
        },
        [store]
    );
    useEffect(
        function saveChangesToDb() {
            if (!isLoaded) {
                return;
            }
            store.setItems(items).then(function () {
                console.log("saved items to", store._config.storeName);
            });
            store.keys().then(function (keys) {
                const deleted = difference(keys, Object.keys(items));
                if (deleted.length > 0 ) {
                    store.removeItems(deleted).then(function () {
                        console.log("Deleted " + deleted.length + " items.");
                    });
                }
            });
        },
        [store, items, isLoaded]
    );
    return [items, dispatch];
}

/*******************************************************************************
 * Player & tournament wrapper hooks
 ******************************************************************************/
export function useAllPlayersDb() {
    return useAllItemsFromDb(playerStore);
}

export function useAllTournamentsDb() {
    return useAllItemsFromDb(tourneyStore);
}

/*******************************************************************************
 * Options database hooks
 ******************************************************************************/
export function useOptionsDb() {
    const [options, dispatch] = useReducer(optionsReducer, demoData.options);
    const [isLoaded, setIsLoaded] = useState(false);
    useEffect(
        function initOptionsFromDb() {
            optionsStore.iterate(function (value, key) {
                dispatch({option: key, type: "SET_OPTION", value: value});
            }).then(function () {
                setIsLoaded(true);
            });
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
