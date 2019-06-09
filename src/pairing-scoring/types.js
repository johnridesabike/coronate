/**
 * This file is a complement to `../data-types/`, except its types are specific
 * to the scoring and pairing functions.
 */
import {Color, Id} from "../data-types";
import t from "tcomb";

const BLACKVALUE = 1;
const WHITEVALUE = -1;
const ColorScore = t.refinement(
    t.Number,
    (num) => num === BLACKVALUE || num === WHITEVALUE,
    "ColorScore"
);
const ScoreData = t.interface(
    {
        colorScores: t.list(ColorScore),
        colors: t.list(Color),
        id: Id,
        opponentResults: t.dict(Id, t.Number),
        ratings: t.list(t.Number),
        results: t.list(t.Number),
        resultsNoByes: t.list(t.Number)
    },
    "ScoreData"
);
const PairingData = t.interface(
    {
        avoidIds: t.list(Id),
        colorScores: t.list(ColorScore),
        colors: t.list(Color),
        id: Id,
        isDueBye: t.Boolean,
        isUpperHalf: t.Boolean,
        opponents: t.list(Id),
        rating: t.Number,
        score: t.Number
    },
    "PairingData"
);
const ScoreCalculator = t.func(
    [t.dict(t.String, ScoreData), Id],
    t.Number,
    "ScoreCalulator"
);
const Standing = t.interface(
    {
        id: Id,
        score: t.Number,
        tieBreaks: t.list(t.Number)
    },
    "Standing"
);

export {
    BLACKVALUE,
    Color,
    PairingData,
    Standing,
    ScoreCalculator,
    ScoreData,
    WHITEVALUE
};
