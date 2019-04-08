import {globalRoster} from "./player";

function replacer(key, value) {
    const recursion = ["tourney", "round"];
    if (recursion.includes(key)) {
        return undefined;
    } else {
        return value;
    }
}

function saveTourneyData(tourney) {
    return JSON.stringify(tourney, replacer, 4);
}

function savePlayerData() {
    return JSON.stringify(globalRoster, null, 4);
}

export default Object.freeze({saveTourneyData, savePlayerData});