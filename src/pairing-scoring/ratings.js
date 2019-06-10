import {BLACK, WHITE} from "../data-types";
import EloRank from "elo-rank";
import t from "tcomb";

function getkFactor(matchCount) {
    const ne = t.Number(matchCount) || 1;
    return (800 / ne);
}

function calcNewRatings(origRatings, matchCounts, result) {
    t.tuple([t.Number, t.Number])(origRatings);
    t.tuple([t.Number, t.Number])(matchCounts);
    t.tuple([t.Number, t.Number])(result);
    const whiteElo = new EloRank(getkFactor(matchCounts[WHITE]));
    const blackElo = new EloRank(getkFactor(matchCounts[BLACK]));
    const FLOOR = 100;
    const scoreExpected = [
        whiteElo.getExpected(origRatings[WHITE], origRatings[BLACK]),
        blackElo.getExpected(origRatings[BLACK], origRatings[WHITE])
    ];
    const newRating = [
        whiteElo.updateRating(
            scoreExpected[WHITE],
            result[WHITE],
            origRatings[WHITE]
        ),
        blackElo.updateRating(
            scoreExpected[BLACK],
            result[BLACK],
            origRatings[BLACK]
        )
    ];
    return newRating.map((rating) => (rating < FLOOR) ? FLOOR : rating);
}

export default Object.freeze({
    calcNewRatings,
    getkFactor
});
