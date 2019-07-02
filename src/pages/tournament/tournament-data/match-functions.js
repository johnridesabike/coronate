// TODO: this file needs to be replaced with something more organized.
import t from "tcomb";
import {
    BLACK,
    DUMMY_ID,
    WHITE,
    createMatch,
    getPlayerMaybe,
    types
} from "../../../data-types";
import {curry} from "ramda";
import {pairPlayers, setByePlayer} from "../../../pairing-scoring";

export function scoreByeMatch(byeValue, match) {
    if (match.playerIds[WHITE] === DUMMY_ID) {
        return {...match, ...{result: [0, byeValue]}};
    } else if (match.playerIds[BLACK] === DUMMY_ID) {
        return {...match, ...{result: [byeValue, 0]}};
    }
    return match;
}

export function autoPair({
    pairData,
    byeValue,
    players,
    tourney
}) {
    // the pairData includes any players who were already matched. We need to
    // only include the specified players. Ramda's `filter` can filter objects.
    const playerIds = Object.keys(players);
    const filteredData = {};
    Object.values(pairData).forEach(function (datum) {
        if (playerIds.includes(datum[/*id*/0])) {
            filteredData[datum[/*id*/0]] = datum;
        }
    });
    const [
        pairDataNoByes,
        byePlayerData
    ] = setByePlayer(tourney.byeQueue, DUMMY_ID, filteredData);
    debugger;
    const pairs = pairPlayers(pairDataNoByes);
    const pairsWithBye = (
        byePlayerData
        ? pairs.concat([[byePlayerData[/*id*/0], DUMMY_ID]])
        : pairs
    );
    const getPlayer = curry(getPlayerMaybe)(players);
    const newMatchList = pairsWithBye.map(
        (idsPair) => (
            createMatch({
                newRating: [
                    getPlayer(idsPair[WHITE]).rating,
                    getPlayer(idsPair[BLACK]).rating
                ],
                origRating: [
                    getPlayer(idsPair[WHITE]).rating,
                    getPlayer(idsPair[BLACK]).rating
                ],
                playerIds: [idsPair[WHITE], idsPair[BLACK]]
            })
        )
    );
    return newMatchList.map(curry(scoreByeMatch)(byeValue));
}

export function manualPair(pair, byeValue) {
    t.tuple([types.Player, types.Player])(pair);
    const match = createMatch({
        newRating: [pair[WHITE].rating, pair[BLACK].rating],
        origRating: [pair[WHITE].rating, pair[BLACK].rating],
        playerIds: [pair[WHITE].id, pair[BLACK].id]
    });
    return scoreByeMatch(byeValue, match);
}
