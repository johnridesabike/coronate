import "side-effects";
import {optionsStore, playerStore, tourneyStore} from "./hooks/db";
import demoData from "./demo-data";

// This stops @reach packages from nagging us about adding their styles.
window.getComputedStyle = jest.fn().mockImplementation(
    () => ({getPropertyValue: () => 1})
);
optionsStore.setItems(demoData.options);
playerStore.setItems(demoData.players);
tourneyStore.setItems(demoData.tournaments);
