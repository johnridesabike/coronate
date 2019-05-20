import {BLACK, WHITE, DUMMY_ID, ANONYMOUS_ID} from "./constants";
import {createPlayer, createMatch, createTournament} from "./factories";
import {AvoidList, Player, Match, Tournament, RoundList} from "./types";

const dummyPlayer = createPlayer({
    id: DUMMY_ID,
    firstName: "Bye",
    lastName: "Player",
    type: "dummy"
});

const anonymousPlayer = createPlayer({
    id: ANONYMOUS_ID,
    firstName: "Anonymous",
    lastName: "Player",
    type: "missing"
});

export {
    dummyPlayer,
    createTournament,
    createPlayer,
    createMatch,
    anonymousPlayer,
    WHITE,
    Tournament,
    RoundList,
    Player,
    Match,
    DUMMY_ID,
    BLACK,
    AvoidList
};
