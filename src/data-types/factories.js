import {Player, Match, Tournament} from "./types";

export function createMatch(importObj) {
    return Match({
        id: importObj.id,
        players: importObj.players,
        result: importObj.result || [0, 0],
        origRating: importObj.origRating,
        newRating: importObj.newRating
    });
}

export function createPlayer(importObj = {}) {
    return Player({
        id: importObj.id || 0,
        type: importObj.type || "person", // used for CSS styling etc.
        firstName: importObj.firstName || "",
        lastName: importObj.lastName || "",
        rating: importObj.rating || 0,
        matchCount: importObj.matchCount || 0
    });
}

export function createTournament(importObj) {
    return Tournament({
        name: importObj.name || "",
        tieBreaks: importObj.tieBreaks || [0, 1, 2, 3],
        byeQueue: importObj.byeQueue || [],
        players: importObj.players || [],
        roundList: importObj.roundList || []
    });
}
