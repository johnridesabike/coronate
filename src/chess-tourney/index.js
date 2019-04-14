// @ts-check
import createMatch from "./match";
import {createPlayer} from "./player";
import {createPlayerManager} from "./player-manager";
import createRound from "./round";
import scores from "./scores";
import createTournament from "./tournament";
import {JSONretriever} from "./config";
/**
 * @typedef {import("./player").Player} Player
 * @typedef {import("./player-manager").PlayerManager } PlayerManager
 * @typedef {import("./round").Round} Round
 * @typedef {import("./match").Match} Match
 * @typedef {import("./config").ConfigItem} ConfigItem
 * @typedef {import("./tournament").Tournament} Tournament
 */

export {
    JSONretriever,
    createMatch,
    createPlayer,
    createRound,
    scores,
    createTournament,
    createPlayerManager
};
