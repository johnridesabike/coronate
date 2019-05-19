import t from "tcomb";

const Match = t.interface({
    id: t.String,
    players: t.tuple([t.Number, t.Number]),
    result: t.tuple([t.Number, t.Number]),
    origRating: t.tuple([t.Number, t.Number]),
    newRating: t.tuple([t.Number, t.Number])
}, "Match");
export {Match};

export function createMatch(importObj) {
    return Match({
        id: importObj.id,
        players: importObj.players,
        result: importObj.result || [0, 0],
        origRating: importObj.origRating,
        newRating: importObj.newRating
    });
}

const Player = t.interface({
    id: t.Number,
    firstName: t.String,
    lastName: t.String,
    rating: t.Number,
    matchCount: t.Number,
    type: t.String
}, "Player");
export {Player};

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

const dummyPlayer = createPlayer({
    id: -1,
    firstName: "Bye",
    lastName: "Player",
    type: "dummy"
});
Object.freeze(dummyPlayer);
export {dummyPlayer};

const RoundList = t.list(t.list(Match));
export {RoundList};

const Tournament = t.interface({
    name: t.String,
    tieBreaks: t.list(t.Number),
    byeQueue: t.list(t.Number),
    players: t.list(t.Number),
    roundList: t.list(t.list(Match))
});
export {Tournament};

export function createTournament(importObj) {
    return Tournament({
        name: importObj.name || "",
        tieBreaks: importObj.tieBreaks || [0, 1, 2, 3],
        byeQueue: importObj.byeQueue || [],
        players: importObj.players || [],
        roundList: importObj.roundList || []
    });
}

const AvoidList = t.list(t.tuple([t.Number, t.Number]));
export {AvoidList};
