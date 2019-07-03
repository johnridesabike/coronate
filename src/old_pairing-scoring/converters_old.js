// These functions are for converting data types defined in `../data-types` to
// data that can be used by the scoring functions in rest of this module.
import {sum} from "ramda";
import {BLACK, WHITE, isDummyId} from "../data-types";
import {createBlankScoreData} from "./Scoring.bs";
import scoreTypes from "./types";
// import t from "tcomb";

function color2Score(color) {
    return color === BLACK ? scoreTypes.BLACKVALUE : scoreTypes.WHITEVALUE;
}

function getOppColor(color) {
    return color === WHITE ? BLACK : WHITE;
}

export function matches2ScoreData(matchList) {
    // return matchList.reduce(match2ScoreDataReducer, {});
    const scoreData = {};
    matchList.forEach(function ({playerIds, result, newRating, origRating}) {
        [WHITE, BLACK].forEach(function dataForColor(color) {
            const id = playerIds[color];
            const oppColor = getOppColor(color);
            const oppId = playerIds[oppColor];
            // Get existing score data to update, or create it fresh
            const oldData = scoreData[id] || createBlankScoreData(id);
            // The ratings will always begin with the `origRating` of the
            // first match they were in.
            const newRatings = (
                oldData.ratings.length === 0
                ? [origRating[color], newRating[color]]
                : [newRating[color]]
            );
            const newResultsNoByes = (
                isDummyId(oppId)
                ? []
                : [result[color]]
            );
            const newOpponentResults = {...oldData.opponentResults};
            if (newOpponentResults[oppId] === undefined) {
                newOpponentResults[oppId] = result[color];
            } else {
                newOpponentResults[oppId] += result[color];
            }
            const newData = {
                results: oldData.results.concat([result[color]]),
                resultsNoByes: oldData.resultsNoByes.concat(newResultsNoByes),
                colors: oldData.colors.concat([color]),
                colorScores: oldData.colorScores.concat([color2Score(color)]),
                opponentResults: newOpponentResults,
                ratings: oldData.ratings.concat(newRatings),
                isDummy: isDummyId(id)
            };
            scoreData[id] = scoreTypes.ScoreData({...oldData, ...newData});
        });
    });
    debugger;
    return scoreData;
}

// Flatten the `[[id1, id2], [id1, id3]]` structure into an easy-to-read
// `{id1: [id2, id3], id2: [id1], id3: [id1]}` structure.
export function avoidPairReducer(acc, pair) {
    const [id1, id2] = pair;
    acc[id1] = acc[id1] ? acc[id1].concat([id2]) : [id2];
    acc[id2] = acc[id2] ? acc[id2].concat([id1]) : [id1];
    // I'm not sure if copying the accumulator object has any benefit, or if it
    // has any (performance) downside.
    return {...acc};
}

export function createPairingData(playerData, avoidPairs, scoreData) {
    const avoidDict = avoidPairs.reduce(avoidPairReducer, {});
    const pairingData = {};
    Object.values(playerData).forEach(function (data) {
        // If there's no scoreData for a player, use empty values
        const playerStats = (
            scoreData[data.id]
            ? scoreData[data.id]
            : createBlankScoreData(data.id)
        );
        // `isUpperHalf` and `halfPos` will have to be set by another
        // function later.
        pairingData[data.id] = scoreTypes.PairingData({
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
        });
    });
    return pairingData;
}
