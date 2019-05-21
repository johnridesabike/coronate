import t from "tcomb";

const AvoidList = t.list(t.tuple([t.Number, t.Number]));
export {AvoidList};

const Player = t.interface(
    {
        id: t.Number,
        firstName: t.String,
        lastName: t.String,
        rating: t.Number,
        matchCount: t.Number,
        type: t.String // used for CSS styling etc
    },
    "Player"
);
export {Player};

const PlayerStats = t.interface(
    {
        profile: Player,
        id: t.Number,
        score: t.Number,
        dueColor: t.maybe(t.Number),
        colorBalance: t.Number,
        opponentHistory: t.list(t.Number),
        upperHalf: t.Boolean,
        rating: t.Number,
        avoidList: t.list(t.Number),
        hasHadBye: t.Boolean,
        isDueBye: t.Boolean
    },
    "PlayerStats"
);
export {PlayerStats};

const Match = t.interface(
    {
        id: t.String,
        players: t.tuple([t.Number, t.Number]),
        result: t.tuple([t.Number, t.Number]),
        origRating: t.tuple([t.Number, t.Number]),
        newRating: t.tuple([t.Number, t.Number])
    },
    "Match"
);
export {Match};

const RoundList = t.list(t.list(Match));
export {RoundList};

const Tournament = t.interface(
    {
        name: t.String,
        tieBreaks: t.list(t.Number),
        byeQueue: t.list(t.Number),
        players: t.list(t.Number),
        roundList: t.list(t.list(Match))
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
