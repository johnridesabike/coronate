// These factories are mainly useful as a shortcut for default values.
import nanoid from "nanoid";
import types from "./types";

export function createMatch(importObj) {
    return types.Match(
        Object.assign(
            {
                id: nanoid(),
                result: [0, 0]
            },
            importObj
        )
    );
}

export function createPlayer(importObj) {
    return types.Player(
        Object.assign(
            {
                id: nanoid(),
                matchCount: 0,
                rating: 0,
                type: "person" // used for CSS styling etc.
            },
            importObj
        )
    );
}

export function createTournament(importObj) {
    return types.Tournament(
        Object.assign(
            {
                byeQueue: [],
                date: new Date(),
                id: nanoid(),
                playerIds: [],
                roundList: [],
                tieBreaks: [0, 1, 2, 3]
            },
            importObj
        )
    );
}
