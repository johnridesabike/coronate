import "localforage-getitems";
import {genericDbReducer, optionsReducer} from "./reducers";
import {useEffect, useReducer, useState} from "react";
import {curry} from "ramda";
import demoOptions from "../state/demo-options.json";
import demoPlayers from "../state/demo-players.json";
import demoTourneys from "../state/demo-tourney.json";
import {extendPrototype} from "localforage-setitems";
import {getPlayerById} from "../pairing-scoring";
import localforage from "localforage";
import t from "tcomb";

extendPrototype(localforage);

const DB_NAME = "Chessahoochee";

const playerStore = localforage.createInstance({
    name: DB_NAME,
    storeName: "Players"
});

demoPlayers.playerList.forEach(function (value) {
    playerStore.setItem(String(value.id), value);
});
export {playerStore};

const optionsStore = localforage.createInstance({
    name: DB_NAME,
    storeName: "Options"
});
optionsStore.setItem("byeValue", demoOptions.byeValue);
optionsStore.setItem("avoidPairs", demoOptions.avoidPairs);
export {optionsStore};

const tourneyStore = localforage.createInstance({
    name: DB_NAME,
    storeName: "Tournaments"
});

demoTourneys.forEach(function (value) {
    tourneyStore.setItem(String(value.id), value);
});
export {tourneyStore};

function useAllItemsFromDb(store) {
    const [items, dispatch] = useReducer(genericDbReducer, {});
    const [isLoaded, setIsLoaded] = useState(false);
    useEffect(
        function loadItemsFromDb() {
            let updatedItems = {};
            store.iterate(function (value, key) {
                // eslint-disable-next-line fp/no-mutation
                updatedItems[key] = value;
            }).then(function () {
                console.log("loaded items from", store._config.storeName);
                dispatch({state: updatedItems, type: "LOAD_STATE"});
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
                console.log("items:", items);
            });
        },
        [store, items, isLoaded]
    );
    return [items, dispatch];
}

export function useAllPlayersDb() {
    return useAllItemsFromDb(playerStore);
}

export function usePlayersDb(ids) {
    t.list(t.Number)(ids);
    const [players, setPlayers] = useState({});
    useEffect(
        function () {
            const idStrings = ids.map((id) => String(id));
            if (idStrings.length > 0) {
                playerStore.getItems(idStrings).then(function (values) {
                    setPlayers(values);
                });
            }
        },
        [ids]
    );
    useEffect(
        function () {
            console.log("player list was updated", players);
        },
        [players]
    );
    const getPlayer = curry(getPlayerById)(players);
    return [players, getPlayer];
}

export function useOptionsDb() {
    const [options, dispatch] = useReducer(optionsReducer, demoOptions);
    useEffect(
        function initOptionsFromDb() {
            optionsStore.iterate(function (value, key) {
                dispatch({option: key, type: "SET_OPTION", value: value});
            });
        },
        []
    );
    useEffect(
        function writeChangesToDb() {
            optionsStore.setItems(options);
        },
        [options]
    );
    return [options, dispatch];
}

export function useTournamentDb(id) {
    const [tourney, setTourney] = useState({});
    useEffect(
        function loadTournamentFromDb() {
            tourneyStore.getItem(String(id)).then(function (value) {
                console.log("got tourney", id, value);
                setTourney(value);
            });
        },
        [id]
    );
    useEffect(
        function saveChangesToDb() {
            tourneyStore.setItem(String(id), tourney);
        },
        [id, tourney]
    );
    return [tourney, setTourney];
}

export function useAllTournamentsDb() {
    return useAllItemsFromDb(tourneyStore);
}
