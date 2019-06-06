import {
    AvoidPair,
    Color,
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

/**
 * The dummy player profile data to display in bye matches.
 */
const dummyPlayer = createPlayer({
    firstName: "Bye",
    id: DUMMY_ID,
    lastName: "Player",
    type: "dummy"
});
/**
 * When `getPlayerMaybe()` can't find a profile, it outputs this instead.
 */
const missingPlayer = (id) => createPlayer({
    firstName: "Anonymous",
    id: id,
    lastName: "Player",
    type: "missing"
});

export {
    AvoidPair,
    BLACK,
    Color,
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
