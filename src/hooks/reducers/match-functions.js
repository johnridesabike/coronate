// TODO: this file needs to be replaced with something more organized.
import {
    AvoidPair,
    BLACK,
    DUMMY_ID,
    Player,
    Tournament,
    WHITE,
    createMatch
} from "../../data-types";
import {assoc} from "ramda";
import nanoid from "nanoid";
import {pairPlayers} from "../../pairing-scoring";
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
    t.dict(t.String, Player)(players);
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
    const newMatchList = pairs.map(
        (idsPair) => (
            createMatch({
                id: nanoid(),
                newRating: [
                    players[idsPair[WHITE]].rating,
                    players[idsPair[BLACK]].rating
                ],
                origRating: [
                    players[idsPair[WHITE]].rating,
                    players[idsPair[BLACK]].rating
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
        id: nanoid(),
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
