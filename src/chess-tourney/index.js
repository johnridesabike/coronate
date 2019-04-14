// @ts-check
import createMatch from "./match";
import {createPlayer} from "./player";
import {createPlayerManager} from "./player-manager";
import createRound from "./round";
import scores from "./scores";
import createTournament from "./tournament";
import {JSONretriever} from "./config";

export {
    JSONretriever,
    createMatch,
    createPlayer,
    createRound,
    scores,
    createTournament,
    createPlayerManager
};
