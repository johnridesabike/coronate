import {genericDbReducer, optionsReducer} from "../reducers";
import demoData from "../../demo-data";
import testData from "../../test-data";
import {useReducer} from "react";
// We're deprecating the `demo-data` in favor of `test-data`. Until old tests
// are updated, we'll merge them together.
const optionsData = Object.assign({}, demoData.options, testData.options);
const tournaments = Object.assign(
    {},
    demoData.tournaments,
    testData.tournaments
);
const playerData = Object.assign({}, demoData.players, testData.players);

// Instead of taking an IndexedDB store as an argument, this takes an object
// with the mocked data.
function useAllItemsFromDb(data) {
    const [items, dispatch] = useReducer(genericDbReducer, data);
    return [items, dispatch];
}
export function useAllPlayersDb() {
    return useAllItemsFromDb(playerData);
}
export function useAllTournamentsDb() {
    return useAllItemsFromDb(tournaments);
}
export function useOptionsDb() {
    const [options, dispatch] = useReducer(optionsReducer, optionsData);
    return [options, dispatch];
}
