import {curry, assoc} from "ramda";
import {BLACK, WHITE, DUMMY_ID, createMatch} from "../data-types";
import {getPlayerById} from "../pairing-scoring/helpers";
import pairPlayers from "../pairing-scoring/pairing";

export function autoPair(
    tourney,
    playerState,
    roundId,
    unPairedPlayers,
    byeValue
) {
    const roundList = tourney.roundList;
    const getPlayer = curry(getPlayerById)(playerState.players);
    const pairs = pairPlayers({
        playerIds: unPairedPlayers,
        roundId,
        roundList,
        playerDataSource: playerState.players,
        avoidList: playerState.avoid,
        byeQueue: tourney.byeQueue
    });
    const newMatchList = pairs.map(
        (pair) => createMatch({
            id: pair.join("-"),
            players: [pair[WHITE], pair[BLACK]],
            origRating: [
                getPlayer(pair[WHITE]).rating,
                getPlayer(pair[BLACK]).rating
            ],
            newRating: [
                getPlayer(pair[WHITE]).rating,
                getPlayer(pair[BLACK]).rating
            ]
        })
    );
    return newMatchList.reduce(
        // Set match results for bye matches
        function (acc, match) {
            if (match.players[WHITE] === DUMMY_ID) {
                return acc.concat([assoc("result", [0, byeValue], match)]);
            }
            if (match.players[BLACK] === DUMMY_ID) {
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
        players: [pair[WHITE], pair[BLACK]],
        origRating: [
            getPlayer(pair[WHITE]).rating,
            getPlayer(pair[BLACK]).rating
        ],
        newRating: [
            getPlayer(pair[WHITE]).rating,
            getPlayer(pair[BLACK]).rating
        ]
    });
    if (pair[WHITE] === DUMMY_ID) {
        return assoc("result", [0, byeValue], match);
    }
    if (pair[BLACK] === DUMMY_ID) {
        return assoc("result", [byeValue, 0], match);
    }
    return match;
}
