// These functions are for converting data types defined in `../data-types` to
// data that can be used by the scoring functions in rest of this module.
import {
    BLACK,
    WHITE,
    isDummyId,
    types
} from "../data-types";
import {
    add,
    append,
    assoc,
    defaultTo,
    lensPath,
    lensProp,
    over,
    pipe,
    sum
} from "ramda";
import {createBlankScoreData} from "./factories";
import scoreTypes from "./types";
import t from "tcomb";

function color2Score(color) {
    return (types.Color(color) === BLACK)
        ? scoreTypes.BLACKVALUE
        : scoreTypes.WHITEVALUE;
}

function match2ScoreDataReducer(acc, match) {
    const {playerIds, result, newRating, origRating} = match;
    const [p1Data, p2Data] = [WHITE, BLACK].map(function dataForColor(color) {
        const id = playerIds[color];
        const oppColor = (color === WHITE) ? BLACK : WHITE;
        const oppId = playerIds[oppColor];
        // Get existing score data to update, or create it fresh
        // The ratings will always begin with the `origRating` of the
        // first match they were in.
        const origData = acc[id] || {id, ratings: [origRating[color]]};
        return pipe(
            over(lensProp("results"), append(result[color])),
            over(
                lensProp("resultsNoByes"),
                (isDummyId(oppId)) ? defaultTo([]) : append(result[color])
            ),
            over(lensProp("colors"), append(color)),
            over(lensProp("colorScores"), append(color2Score(color))),
            over(
                lensPath(["opponentResults", oppId]),
                pipe(defaultTo(0), add(result[color]))
            ),
            over(lensProp("ratings"), append(newRating[color])),
            assoc("isDummy", isDummyId(id))
        )(origData);
    });
    return pipe(
        assoc(p1Data.id, p1Data),
        assoc(p2Data.id, p2Data)
    )(acc);
}

export function matches2ScoreData(matchList) {
    const data = matchList.reduce(match2ScoreDataReducer, {});
    // TODO: remove this tcomb check for production
    return t.dict(types.Id, scoreTypes.ScoreData)(data);
}

// Flatten the `[[id1, id2], [id1, id3]]` structure into an easy-to-read
// `{id1: [id2, id3], id2: [id1], id3: [id1]}` structure.
export function avoidPairReducer(acc, pair) {
    return pipe(
        over(lensProp(pair[0]), append(pair[1])),
        over(lensProp(pair[1]), append(pair[0]))
    )(t.dict(types.Id, t.list(types.Id))(acc));
}

export function createPairingData(playerData, avoidPairs, scoreData) {
    const avoidDict = avoidPairs.reduce(avoidPairReducer, {});
    const pairingData = Object.values(playerData).map(
        function pairingDataReducer(data) {
            // If there's no scoreData for a player, use empty values
            const playerStats = (scoreData[data.id])
                ? scoreData[data.id]
                : createBlankScoreData(data.id);
            // `isUpperHalf` and `halfPos` will have to be set by another
            // function later.
            return {
                avoidIds: avoidDict[data.id] || [],
                colorScores: playerStats.colorScores,
                colors: playerStats.colors,
                halfPos: 0,
                id: data.id,
                // isDueBye: false,
                isUpperHalf: false,
                opponents: Object.keys(playerStats.opponentResults),
                rating: data.rating,
                // `score` is calculated and cached here because the blossom
                // pairing will reuse it many times.
                score: sum(playerStats.results)
            };
        }
    );
    // TODO: remove this tcomb check for production
    return t.list(scoreTypes.PairingData)(pairingData);
}
