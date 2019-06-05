import {BLACK, WHITE} from "../data-types";
import {BLACKVALUE, Color, WHITEVALUE} from "./types";
import {append, assoc, lensProp, over, pipe, when} from "ramda";
import {isNotDummy} from "./helpers";

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
    return data;
}
