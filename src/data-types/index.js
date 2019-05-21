import {BLACK, WHITE, DUMMY_ID} from "./constants";
import {createPlayer, createMatch, createTournament} from "./factories";
import {AvoidList, Player, Match, Tournament, RoundList} from "./types";

const dummyPlayer = createPlayer({
    id: DUMMY_ID,
    firstName: "Bye",
    lastName: "Player",
    type: "dummy"
});

const missingPlayer = (id) => createPlayer({
    id: id,
    firstName: "Anonymous",
    lastName: "Player",
    type: "missing"
});

export {
    AvoidList,
    BLACK,
    DUMMY_ID,
    Match,
    Player,
    RoundList,
    Tournament,
    WHITE,
    createMatch,
    createPlayer,
    createTournament,
    dummyPlayer,
    missingPlayer
};
