import {BLACK, WHITE} from "./constants";
import t from "tcomb";

const Id = t.refinement(
    t.String,
    (id) => /^[A-Za-z0-9_-]{21}$/.test(id),
    "NanoId"
);

const Color = t.refinement(
    t.Number,
    (num) => num === BLACK || num === WHITE,
    "Color"
);

const AvoidPair = t.tuple([Id, Id], "AvoidPair");

const Player = t.interface(
    {
        firstName: t.String,
        id: Id,
        lastName: t.String,
        matchCount: t.Number,
        rating: t.Number,
        type: t.String // used for CSS styling etc
    },
    "Player"
);

const Match = t.interface(
    {
        id: Id,
        newRating: t.tuple([t.Number, t.Number]),
        origRating: t.tuple([t.Number, t.Number]),
        playerIds: t.tuple([Id, Id]),
        result: t.tuple([t.Number, t.Number])
    },
    "Match"
);

const RoundList = t.list(t.list(Match), "RoundList");

const Tournament = t.interface(
    {
        byeQueue: t.list(t.String),
        date: Date,
        id: Id,
        name: t.String,
        playerIds: t.list(t.String),
        roundList: RoundList,
        tieBreaks: t.list(t.Number)
    },
    "Tournament"
);

const db = Object.freeze({
    Options: t.interface(
        {
            avoidPairs: t.list(AvoidPair),
            byeValue: t.refinement(t.Number, (num) => num === 1 || num === 0.5),
            lastBackup: Date
        },
        "Options"
    ),
    Tourneys: t.dict(Id, Tournament, "TournamentsDB"),
    Players: t.dict(Id, Player, "PlayersDB")
});

export default Object.freeze({
    AvoidPair,
    Color,
    Id,
    Match,
    Player,
    RoundList,
    Tournament,
    db
});
