import "localforage-getitems";
// import {curry, difference} from "ramda";
import {genericDbReducer, optionsReducer} from "./reducers";
import {useEffect, useReducer, useState} from "react";
import demoData from "../demo-data";
import {difference} from "ramda";
// import {getPlayerById} from "../pairing-scoring";
import localForage from "localforage";
import {extendPrototype as removeItemsPrototype} from "localforage-removeitems";
import {extendPrototype as setItemsPrototype} from "localforage-setitems";
// import t from "tcomb";

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
 * Player database hooks
 ******************************************************************************/
export function useAllPlayersDb() {
    return useAllItemsFromDb(playerStore);
}

// export function usePlayersDb(ids) {
//     t.list(t.Number)(ids);
//     const [players, setPlayers] = useState({});
//     useEffect(
//         function () {
//             const idStrings = ids.map((id) => String(id));
//             if (idStrings.length > 0) {
//                 playerStore.getItems(idStrings).then(function (values) {
//                     setPlayers(values);
//                 });
//             }
//         },
//         [ids]
//     );
//     useEffect(
//         function () {
//             console.log("player list was updated", players);
//         },
//         [players]
//     );
//     const getPlayer = curry(getPlayerById)(players);
//     return [players, getPlayer];
// }

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

/*******************************************************************************
 * Tournament database hooks
 ******************************************************************************/
// export function useTournamentDb(id) {
//     const [tourney, setTourney] = useState({});
//     useEffect(
//         function loadTournamentFromDb() {
//             tourneyStore.getItem(String(id)).then(function (value) {
//                 console.log("got tourney", id, value);
//                 setTourney(value);
//             });
//         },
//         [id]
//     );
//     useEffect(
//         function saveChangesToDb() {
//             tourneyStore.setItem(String(id), tourney);
//         },
//         [id, tourney]
//     );
//     return [tourney, setTourney];
// }

export function useAllTournamentsDb() {
    return useAllItemsFromDb(tourneyStore);
}
