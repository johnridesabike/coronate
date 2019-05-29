// These factories are mainly useful as a shortcut to provide default values.
import {Match, Player, Tournament} from "./types";
import nanoid from "nanoid";

export function createMatch(importObj) {
    return Match({
        id: importObj.id || nanoid(),
        newRating: importObj.newRating,
        origRating: importObj.origRating,
        playerIds: importObj.playerIds,
        result: importObj.result || [0, 0]
    });
}

export function createPlayer(importObj = {}) {
    return Player({
        firstName: importObj.firstName || "",
        id: importObj.id || nanoid(),
        lastName: importObj.lastName || "",
        matchCount: importObj.matchCount || 0,
        rating: importObj.rating || 0,
        type: importObj.type || "person" // used for CSS styling etc.
    });
}

export function createTournament(importObj) {
    return Tournament({
        byeQueue: importObj.byeQueue || [],
        date: importObj.date || new Date(),
        id: importObj.id || nanoid(),
        name: importObj.name || "",
        playerIds: importObj.playerIds || [],
        roundList: importObj.roundList || [],
        tieBreaks: importObj.tieBreaks || [0, 1, 2, 3]
    });
}
