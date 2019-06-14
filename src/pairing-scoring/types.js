/**
 * This file is a complement to `../data-types/`, except its types are specific
 * to the scoring and pairing functions.
 */
import t from "tcomb";
import {types} from "../data-types";

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
        colors: t.list(types.Color),
        id: types.Id,
        isDummy: t.Boolean,
        opponentResults: t.dict(types.Id, t.Number),
        ratings: t.list(t.Number),
        results: t.list(t.Number),
        resultsNoByes: t.list(t.Number)
    },
    "ScoreData"
);
const PairingData = t.interface(
    {
        avoidIds: t.list(types.Id),
        colorScores: t.list(ColorScore),
        colors: t.list(types.Color),
        // `halfPos` is the index of the player within their scoregroup that's
        // split into upper and lower halves. Example: in a group of 8, the
        // first and the fifth players would both be `halfPos: 0`.
        halfPos: t.Number,
        id: types.Id,
        // isDueBye: t.Boolean,
        isUpperHalf: t.Boolean,
        opponents: t.list(types.Id),
        rating: t.Number,
        score: t.Number
    },
    "PairingData"
);
const ScoreCalculator = t.func(
    [t.dict(t.String, ScoreData), types.Id],
    t.Number,
    "ScoreCalulator"
);
const Standing = t.interface(
    {
        id: types.Id,
        score: t.Number,
        tieBreaks: t.list(t.Number)
    },
    "Standing"
);

export default Object.freeze({
    BLACKVALUE,
    PairingData,
    ScoreCalculator,
    ScoreData,
    Standing,
    WHITEVALUE
});
