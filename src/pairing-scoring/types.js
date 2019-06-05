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
const PairingData = ScoreData.extend(
    {
        avoidIds: t.list(Id),
        upperHalf: t.Boolean
    },
    "PairingData"
);

export {BLACKVALUE, Color, PairingData, ScoreData, WHITEVALUE};
