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
        type: t.String
    },
    "Player"
);
export {Player};

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


