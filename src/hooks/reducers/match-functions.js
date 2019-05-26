// TODO: this file needs to be replaced with something more organized.
import {
    AvoidPair,
    BLACK,
    DUMMY_ID,
    Id,
    Player,
    Tournament,
    WHITE,
    createMatch
} from "../../data-types";
import {assoc, curry} from "ramda";
import {getPlayerMaybe, pairPlayers} from "../../pairing-scoring";
import t from "tcomb";

export function autoPair({
    avoidList,
    byeValue,
    players,
    roundId,
    tourney
}) {
    t.list(AvoidPair)(avoidList);
    t.Number(byeValue);
    Tournament(tourney);
    t.dict(Id, Player)(players);
    t.Number(roundId);
    const roundList = tourney.roundList;
    const pairs = pairPlayers({
        avoidList: avoidList,
        byeQueue: tourney.byeQueue,
        players,
        roundId,
        roundList
    });
    console.log("pairs", pairs);
    console.log("players", players);
    const getPlayer = curry(getPlayerMaybe)(players);
    const newMatchList = pairs.map(
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
    t.tuple([Player, Player])(pair);
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
