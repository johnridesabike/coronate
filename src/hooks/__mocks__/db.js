import {genericDbReducer, optionsReducer} from "../reducers";
import demoData from "../../demo-data";
import {useReducer} from "react";

/**
 * Instead of taking an IndexedDB store as an argument, this takes an object
 * with the mocked data.
 */
function useAllItemsFromDb(data) {
    const [items, dispatch] = useReducer(genericDbReducer, data);
    return [items, dispatch];
}
export function useAllPlayersDb() {
    return useAllItemsFromDb(demoData.players);
}
export function useAllTournamentsDb() {
    return useAllItemsFromDb(demoData.tournaments);
}
export function useOptionsDb() {
    const [options, dispatch] = useReducer(optionsReducer, demoData.options);
    return [options, dispatch];
}
