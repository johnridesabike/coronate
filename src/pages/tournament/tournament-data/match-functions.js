// TODO: this file needs to be replaced with something more organized.
import {
    BLACK,
    DUMMY_ID,
    WHITE,
    createMatch,
    getPlayerMaybe,
    types
} from "../../../data-types";
import {assoc, curry} from "ramda";
import {pairPlayers, setByePlayer} from "../../../pairing-scoring";
import t from "tcomb";

export function scoreByeMatch(byeValue, match) {
    if (match.playerIds[WHITE] === DUMMY_ID) {
        return assoc("result", [0, byeValue], match);
    } else if (match.playerIds[BLACK] === DUMMY_ID) {
        return assoc("result", [byeValue, 0], match);
    }
    return match;
}

export function autoPair({
    pairData,
    byeValue,
    players,
    tourney
}) {
    const [
        pairDataNoByes,
        byePlayerData
    ] = setByePlayer(tourney.byeQueue, DUMMY_ID, pairData);
    const pairs = pairPlayers(pairDataNoByes);
    const pairsWithBye = (
        byePlayerData
        ? pairs.concat([[byePlayerData.id, DUMMY_ID]])
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
