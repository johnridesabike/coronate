import t from "tcomb";

const AvoidList = t.list(t.tuple([t.Number, t.Number]));
export {AvoidList};

const Player = t.interface(
    {
        firstName: t.String,
        id: t.Number,
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
        avoidList: t.list(t.Number),
        colorBalance: t.Number,
        dueColor: t.maybe(t.Number),
        hasHadBye: t.Boolean,
        id: t.Number,
        isDueBye: t.Boolean,
        opponentHistory: t.list(t.Number),
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
        id: t.String,
        newRating: t.tuple([t.Number, t.Number]),
        origRating: t.tuple([t.Number, t.Number]),
        players: t.tuple([t.Number, t.Number]),
        result: t.tuple([t.Number, t.Number])
    },
    "Match"
);
export {Match};

const RoundList = t.list(t.list(Match));
export {RoundList};

const Tournament = t.interface(
    {
        byeQueue: t.list(t.Number),
        name: t.String,
        players: t.list(t.Number),
        roundList: t.list(t.list(Match)),
        tieBreaks: t.list(t.Number)
    },
    "Tournament"
);
export {Tournament};

const ScoreCalulator = t.func(
    [t.Number, t.list(Match)],
    t.Number,
    "ScoreCalulator"
);
export {ScoreCalulator};

const Standing = t.interface(
    {
        id: t.Number,
        score: t.Number,
        tieBreaks: t.list(t.Number)
    },
    "Standing"
);
export {Standing};
