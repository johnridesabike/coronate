// @ts-check
import {createPlayer, dummyPlayer} from "./player";
/**
 * @typedef {import("./tournament").Tournament} Tournament
 * @typedef {import("./player").Player} Player
 * @typedef {import("./player").playerProps} playerProps
 */
/**
 * @typedef {Object} PlayerManager
 * @property {Player[]} playerList
 * @property {number} lastId
 * @property {number[][]} avoidList
 * @property {function(number): Player} getPlayerById
 * @property {function(playerProps): Player} addPlayer
 * @property {function(playerProps[]): void} loadPlayerData
 * @property {(playerId: number) => Player=} delPlayer
 * @property {(player: number) => number[]} getPlayerAvoidList
 * @property {(player1: number, player2: number) => void} avoidListAdd
 * @property {(player1: number, player2: number) => void} avoidListRemove
 */
/**
 * @typedef {Object} playerManagerProps
 * @property {Player[]} playerList
 * @property {number} lastId
 * @property {?tournament} ref_tourney
 */
/**
 *
 * @param {Object} importObj
 * @param {playerProps[]} [importObj.playerList]
 * @param {number} [importObj.lastId]
 * @param {Player[]} [importObj.inactive]
 * @param {number[][]} [importObj.avoidList]
 * @returns {PlayerManager}
 */
function createPlayerManager(importObj = {}) {
    /** @type {PlayerManager} */
    const manager = {
        playerList: [],
        lastId: importObj.lastId || -1,
        avoidList: importObj.avoidList || [],
        getPlayerById(id) {
            if (id === -1) {
                return dummyPlayer;
            }
            return manager.playerList.filter((p) => p.id === id)[0];
        },
        addPlayer(playerData) {
            if (!playerData.id) {
                playerData.id = manager.lastId + 1;
            }
            if (playerData.id > manager.lastId) {
                manager.lastId = playerData.id;
            }
            let player = createPlayer(playerData);
            manager.playerList.push(player);
            return player;
        },
        loadPlayerData(data) {
            manager.playerList = data.map(
                (player) => createPlayer(player)
            );
        },
        delPlayer(playerId) {
            const index = manager.playerList.map(
                (p) => p.id
            ).indexOf(
                Number(playerId)
            );
            if (index === -1) {
                return null;
            }
            return manager.playerList.splice(index, 1)[0];
        },
        getPlayerAvoidList(playerId) {
            return manager.avoidList.filter( // get pairings with the player
                (pair) => pair.includes(playerId)
            ).reduce( // Flatten the array
                (accumulator, pair) => pair.concat(accumulator),
                []
            ).filter( // filter out the player's id
                (id) => id !== playerId
            );
        },
        avoidListAdd(player1, player2) {
            // This probably needs to be made smarter to avoid duplicates
            const pair = [player1, player2];
            pair.sort();
            manager.avoidList = manager.avoidList.concat([pair]);
        },
        avoidListRemove(player1, player2) {
            const newList = manager.avoidList.filter(
                (pair) => !(pair.includes(player1) && pair.includes(player2))
            );
            manager.avoidList = newList;
        }
    };
    if (importObj.playerList) {
        importObj.playerList.forEach(function (player) {
            manager.addPlayer(player);
        });
    }
    return manager;
}

export {createPlayerManager};