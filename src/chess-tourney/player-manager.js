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
 * @property {function(number): void} delPlayer
 * @property {(player: number) => number[]} getPlayerAvoidList
 * @property {function(Player): void} removePlayer
 * @property {function(number): void} removePlayerById
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
        // getActive() {
        //     return manager.roster.filter(
        //         (i) => !manager.inactive.includes(i)
        //     );
        // },
        // exportPlayerById(id) {
        //     const player = manager.getPlayerById(id);
        //     const clone = createPlayer(player);
        //     return clone;
        // },
        // importPlayerById(fromRoster, playerId) {
        //     let player = fromRoster.getPlayerById(playerId);
        //     manager.roster.push(player);
        //     return manager;
        // },
        // importPlayerList(playerList) {
        //     manager.roster = playerList;
        //     return manager;
        // },
        removePlayer(player) {
            // if (manager.canRemovePlayer(player)) {
            //     throw new Error("Can't remove player " + player);
            // }
            delete manager.playerList[manager.playerList.indexOf(player)];
            return manager;
        },
        removePlayerById(id) {
            manager.removePlayer(manager.getPlayerById(id));
            return manager;
        },
        getPlayerById(id) {
            if (id === -1) {
                return dummyPlayer;
            }
            return manager.playerList.filter((p) => p.id === id)[0];
        },
        // canRemovePlayer(id) {
        //     return (
        //         manager.ref_tourney.getMatchesByPlayer(
        //             id,
        //             null
        //         ).length > 0
        //     );
        // },
        // canRemovePlayerById(id) {
        //     return manager.canRemovePlayer(manager.getPlayerById(id));
        // },
        // setByIdList(playerManager, list) {
        //     const currentIds = manager.roster.map((p) => p.id);
        //     const toAdd = list.filter((id) => !currentIds.includes(id));
        //     const toRemove = currentIds.filter((id) => !list.includes(id));
        //     toAdd.forEach((id) => manager.importPlayerById(playerManager,
        // id));
        //     toRemove.forEach((id) => manager.removePlayerById(id));
        //     manager.avoidList = playerManager.avoidList;
        // },
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
        // addPlayers(playersData) {
        //     return playersData.map(
        //         (player) => manager.addPlayer(player)
        //     );
        // },
        loadPlayerData(data) {
            manager.playerList = data.map(
                (player) => createPlayer(player)
            );
        },
        delPlayer(playerId) {
            let index = manager.playerList.map(
                (p) => p.id
            ).indexOf(
                Number(playerId)
            );
            if (index === -1) {
                return null;
            }
            let player = manager.playerList.splice(index, 1);
            return player;
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
            let newList = manager.avoidList.filter(
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