import {
    AvoidPair,
    Id,
    Match,
    Player,
    PlayerStats,
    RoundList,
    ScoreCalulator,
    Standing,
    Tournament
} from "./types";
import {BLACK, DUMMY_ID, WHITE} from "./constants";
import {createMatch, createPlayer, createTournament} from "./factories";

const dummyPlayer = createPlayer({
    firstName: "Bye",
    id: DUMMY_ID,
    lastName: "Player",
    type: "dummy"
});

const missingPlayer = (id) => createPlayer({
    firstName: "Anonymous",
    id: id,
    lastName: "Player",
    type: "missing"
});

export {
    AvoidPair,
    BLACK,
    DUMMY_ID,
    Id,
    Match,
    Player,
    PlayerStats,
    RoundList,
    ScoreCalulator,
    Standing,
    Tournament,
    WHITE,
    createMatch,
    createPlayer,
    createTournament,
    dummyPlayer,
    missingPlayer
};
