// These factories are mainly useful as a shortcut for default values.
import nanoid from "nanoid";
import types from "./types";

export function createMatch(importObj) {
    return types.Match({
        id: importObj.id || nanoid(),
        newRating: importObj.newRating,
        origRating: importObj.origRating,
        playerIds: importObj.playerIds,
        result: importObj.result || [0, 0]
    });
}

export function createPlayer(importObj = {}) {
    return types.Player({
        firstName: importObj.firstName,
        id: importObj.id || nanoid(),
        lastName: importObj.lastName,
        matchCount: importObj.matchCount || 0,
        rating: importObj.rating || 0,
        type: importObj.type || "person" // used for CSS styling etc.
    });
}

// eslint-disable-next-line complexity
export function createTournament(importObj) {
    return types.Tournament({
        byeQueue: importObj.byeQueue || [],
        date: importObj.date || new Date(),
        id: importObj.id || nanoid(),
        name: importObj.name,
        playerIds: importObj.playerIds || [],
        roundList: importObj.roundList || [],
        tieBreaks: importObj.tieBreaks || [0, 1, 2, 3]
    });
}
