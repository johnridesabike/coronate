// TODO: this file needs to be replaced with something more organized.
import {
    BLACK,
    DUMMY_ID,
    WHITE,
    createMatch,
    getPlayerMaybe,
    rounds2Matches,
    types
} from "../../data-types";
import {assoc, pipe} from "ramda";
import {
    createPairingData,
    matches2ScoreData,
    pairPlayers,
    setByePlayer,
    setUpperHalves,
    sortDataForPairing
} from "../../pairing-scoring";
import t from "tcomb";

export function autoPair({
    avoidList,
    byeValue,
    players,
    roundId,
    tourney
}) {
    const roundList = tourney.roundList;
    const scoreData = pipe(
        (rounds) => rounds2Matches(rounds, roundId),
        matches2ScoreData,
    )(roundList);
    const pairData = pipe(
        createPairingData(players, avoidList),
        sortDataForPairing,
        setUpperHalves,
    )(scoreData);
    const [
        pairDataNoByes,
        byePlayerData
    ] = setByePlayer(tourney.byeQueue, DUMMY_ID, pairData);
    const pairs = pairPlayers(pairDataNoByes);
    const pairsWithBye = (byePlayerData)
        ? pairs.concat([[byePlayerData.id, DUMMY_ID]])
        : pairs;
    const getPlayer = getPlayerMaybe(players);
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
    return newMatchList.reduce(
        // Set match results for bye matches
        function (acc, match) {
            if (match.playerIds[WHITE] === DUMMY_ID) {
                return acc.concat([assoc("result", [0, byeValue], match)]);
            }
            if (match.playerIds[BLACK] === DUMMY_ID) {
                return acc.concat([assoc("result", [byeValue, 0], match)]);
            }
            return acc.concat([match]);
        },
        []
    );
}

export function manualPair(pair, byeValue) {
    t.tuple([types.Player, types.Player])(pair);
    const match = createMatch({
        newRating: [pair[WHITE].rating, pair[BLACK].rating],
        origRating: [pair[WHITE].rating, pair[BLACK].rating],
        playerIds: [pair[WHITE].id, pair[BLACK].id]
    });
    if (pair[WHITE].id === DUMMY_ID) {
        return assoc("result", [0, byeValue], match);
    }
    if (pair[BLACK].id === DUMMY_ID) {
        return assoc("result", [byeValue, 0], match);
    }
    return match;
}
