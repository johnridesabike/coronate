import {globalRoster, createPlayer} from "./player";

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

function loadPlayerData(input) {
    let newRoster = JSON.parse(input);
    newRoster.roster = newRoster.roster.map(function (player) {
        return createPlayer(player);
    });
    Object.assign(globalRoster, newRoster);
}

function loadTournamentData(input) {
    // TODO
}

export default Object.freeze({
    saveTourneyData,
    savePlayerData,
    loadPlayerData
});