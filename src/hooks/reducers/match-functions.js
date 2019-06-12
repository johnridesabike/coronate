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

export function scoreByeMatch(match, byeValue) {
    if (match.playerIds[WHITE] === DUMMY_ID) {
        return assoc("result", [0, byeValue], match);
    } else if (match.playerIds[BLACK] === DUMMY_ID) {
        return assoc("result", [byeValue, 0], match);
    }
    return match;
}

// TODO: This will calculate pairing data based on the players provided.
// However, if there are players who were manually paired earlier, then their
// presence will not be factored in (for calculating upper & lower halves, for
// example). It may make sense to raise the `createPairingData()` result to the
// component which calls this, since that component usually calculates that data
// anyway for GUI purposes.
export function autoPair({
    avoidList,
    byeValue,
    players,
    roundId,
    tourney
}) {
    const pairData = pipe(
        (rounds) => rounds2Matches(rounds, roundId),
        matches2ScoreData,
        createPairingData(players, avoidList),
        sortDataForPairing,
        setUpperHalves,
    )(tourney.roundList);
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
        (acc, match) => acc.concat([scoreByeMatch(match, byeValue)]),
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
    return scoreByeMatch(match, byeValue);
}
