import {BLACK, Id, WHITE} from "../data-types";
import {BLACKVALUE, Color, ScoreData, WHITEVALUE} from "./types";
import {append, assoc, last, lensProp, over, pipe, sum, when} from "ramda";
import {isNotDummy} from "./helpers";
import t from "tcomb";

function color2Score(color) {
    return (Color(color) === BLACK) ? BLACKVALUE : WHITEVALUE;
}

export function matches2ScoreData(matchList) {
    const data = matchList.reduce(
        function (acc, match) {
            const {playerIds, result} = match;
            const [p1Data, p2Data] = [WHITE, BLACK].map(function (color) {
                const oppColor = (color === WHITE) ? BLACK : WHITE;
                const id = playerIds[color];
                const oppId = playerIds[oppColor];
                // Get existing score data to update, or create it fresh
                const origData = acc[id] || {id};
                return pipe(
                    over(lensProp("results"), append(result[color])),
                    when(
                        () => isNotDummy(oppId),
                        over(lensProp("resultsNoByes"), append(result[color]))
                    ),
                    over(lensProp("colors"), append(color)),
                    over(lensProp("colorScores"), append(color2Score(color))),
                    over(lensProp("opponentIds"), append(oppId))
                )(origData);
            });
            return pipe(
                assoc(p1Data.id, p1Data),
                assoc(p2Data.id, p2Data)
            )(acc);
        },
        {}
    );
    // TODO: remove this tcomb check for production
    return t.dict(Id, ScoreData)(data);
}

/*******************************************************************************
 * The main scoring methods
 ******************************************************************************/
function getPlayerScore(scoreData, id) {
    return sum(scoreData[id].results);
}

function getCumulativeScore(scoreData, id) {
    const scoreList = scoreData[id].resultsNoByes.reduce(
        // turn the regular score list into a "running" score list
        (acc, score) => acc.concat([last(acc) + score]),
        [0]
    );
    return sum(scoreList);
}

function getCumulativeOfOpponentScore(scoreData, id) {
    const scoreList = scoreData[id].opponentIds.filter(
        isNotDummy
    ).map(
        // TODO: properly curry this function
        (oppId) => getCumulativeScore(scoreData, oppId)
    );
    return sum(scoreList);
}

function getColorBalanceScore(scoredata, id) {
    
}
