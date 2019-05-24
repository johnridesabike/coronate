import {
    AvoidPair,
    BLACK,
    DUMMY_ID,
    Player,
    Tournament,
    WHITE,
    createMatch
} from "../data-types";
import {assoc, curry} from "ramda";
import {getPlayerById, pairPlayers} from "../pairing-scoring";
import t from "tcomb";

export function autoPair({
    avoidList,
    byeValue,
    playerDataList,
    unPairedPlayers,
    roundId,
    tourney
}) {
    t.list(AvoidPair)(avoidList);
    t.Number(byeValue);
    t.list(Player)(playerDataList);
    Tournament(tourney);
    t.list(t.Number)(unPairedPlayers);
    t.Number(roundId);
    const roundList = tourney.roundList;
    const getPlayer = curry(getPlayerById)(playerDataList);
    const pairs = pairPlayers({
        avoidList: avoidList,
        byeQueue: tourney.byeQueue,
        playerDataSource: playerDataList,
        playerIds: unPairedPlayers,
        roundId,
        roundList
    });
    const newMatchList = pairs.map(
        (pair) => createMatch({
            id: pair.join("-"),
            newRating: [
                getPlayer(pair[WHITE]).rating,
                getPlayer(pair[BLACK]).rating
            ],
            origRating: [
                getPlayer(pair[WHITE]).rating,
                getPlayer(pair[BLACK]).rating
            ],
            players: [pair[WHITE], pair[BLACK]]
        })
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

export function manualPair(players, pair, byeValue) {
    const getPlayer = curry(getPlayerById)(players);
    const match = createMatch({
        id: pair.join("-"),
        newRating: [
            getPlayer(pair[WHITE]).rating,
            getPlayer(pair[BLACK]).rating
        ],
        origRating: [
            getPlayer(pair[WHITE]).rating,
            getPlayer(pair[BLACK]).rating
        ],
        players: [pair[WHITE], pair[BLACK]]
    });
    if (pair[WHITE] === DUMMY_ID) {
        return assoc("result", [0, byeValue], match);
    }
    if (pair[BLACK] === DUMMY_ID) {
        return assoc("result", [byeValue, 0], match);
    }
    return match;
}
