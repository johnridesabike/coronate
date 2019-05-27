import t from "tcomb";

const Id = t.refinement(
    t.String,
    (id) => /^[A-Za-z0-9_-]{21}$/.test(id),
    "NanoId"
);
export {Id};

const AvoidPair = t.tuple([Id, Id], "AvoidPair");
export {AvoidPair};

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
export {Player};

const PlayerStats = t.interface(
    {
        avoidList: t.list(Id),
        colorBalance: t.Number,
        dueColor: t.maybe(t.Number),
        hasHadBye: t.Boolean,
        id: Id,
        isDueBye: t.Boolean,
        opponentHistory: t.list(Id),
        profile: Player,
        rating: t.Number,
        score: t.Number,
        upperHalf: t.Boolean
    },
    "PlayerStats"
);
export {PlayerStats};

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
export {Match};

const RoundList = t.list(t.list(Match), "Round list");
export {RoundList};

const Tournament = t.interface(
    {
        byeQueue: t.list(t.String),
        id: Id,
        name: t.String,
        playerIds: t.list(t.String),
        roundList: RoundList,
        tieBreaks: t.list(t.Number)
    },
    "Tournament"
);
export {Tournament};

const ScoreCalulator = t.func(
    [Id, t.list(Match)],
    t.Number,
    "ScoreCalulator"
);
export {ScoreCalulator};

const Standing = t.interface(
    {
        id: Id,
        score: t.Number,
        tieBreaks: t.list(t.Number)
    },
    "Standing"
);
export {Standing};
