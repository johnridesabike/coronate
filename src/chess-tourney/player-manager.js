// @ts-check
import {createPlayer, dummyPlayer} from "./player";
/**
 * @typedef {import("./tournament").Tournament} Tournament
 * @typedef {import("./player").Player} Player
 * @typedef {import("./player").playerProps} playerProps
 */
/**
 * @typedef {Object} PlayerManager
 * @property {Player[]} roster
 * @property {number} lastId
 * @property {?Tournament} ref_tourney
 * @property {Player[]} inactive
 * @property {number[][]} avoidList
 * @property {function(): Player[]} getActive
 * @property {(id: number) => Player} exportPlayerById
 * @property {function(PlayerManager, number): void} importPlayerById
 * @property {function(Player[]): void} importPlayerList
 * @property {function(Player): void} deactivatePlayer
 * @property {function(Player): void} activatePlayer
 * @property {function(Player): void} removePlayer
 * @property {function(number): void} removePlayerById
 * @property {function(number): Player} getPlayerById
 * @property {function(Player): boolean} canRemovePlayer
 * @property {function(number): boolean} canRemovePlayerById
 * @property {function(PlayerManager, Array<number>): void } setByIdList
 * @property {function(playerProps): Player} addPlayer
 * @property {function(Array<playerProps>): Player[]} addPlayers
 * @property {function(Array<playerProps>): void} loadPlayerData
 * @property {function(number): void} delPlayer
 * @property {(player: Player) => Player[]} getPlayerAvoidList
 */
/**
 * @typedef {Object} playerManagerProps
 * @property {Array<player>} roster
 * @property {number} lastId
 * @property {?tournament} ref_tourney
 * @property {Array<player>} inactive
 */
/**
 *
 * @param {Object} importObj
 * @param {playerProps[]} [importObj.roster]
 * @param {number} [importObj.lastId]
 * @param {Tournament | null} [importObj.ref_tourney]
 * @param {Player[]} [importObj.inactive]
 * @param {number[][]} [importObj.avoidList]
 * @param {?PlayerManager} playerSource
 * @returns {PlayerManager}
 */
function createPlayerManager(importObj = {}, playerSource = null) {
    /** @type {PlayerManager} */
    const pManager = {
        roster: [],
        lastId: importObj.lastId || -1,
        ref_tourney: importObj.ref_tourney || null,
        inactive: importObj.inactive || [],
        avoidList: importObj.avoidList || [],
        getActive() {
            return pManager.roster.filter(
                (i) => !pManager.inactive.includes(i)
            );
        },
        exportPlayerById(id) {
            const player = pManager.getPlayerById(id);
            const clone = createPlayer(player);
            return clone;
        },
        importPlayerById(fromRoster, playerId) {
            let player = fromRoster.getPlayerById(playerId);
            pManager.roster.push(player);
            return pManager;
        },
        importPlayerList(playerList) {
            pManager.roster = playerList;
            return pManager;
        },
        deactivatePlayer(player) {
            pManager.inactive.push(player);
            return pManager;
        },
        activatePlayer(player) {
            pManager.inactive.splice(pManager.inactive.indexOf(player), 1);
            return pManager;
        },
        removePlayer(player) {
            if (pManager.canRemovePlayer(player)) {
                return null; // TODO: add a helpful error message
            }
            delete pManager.roster[pManager.roster.indexOf(player)];
            return pManager;
        },
        removePlayerById(id) {
            pManager.removePlayer(pManager.getPlayerById(id));
            return pManager;
        },
        getPlayerById(id) {
            let player;
            if (id === -1) {
                player = dummyPlayer;
            }
            player = pManager.roster.filter((p) => p.id === id)[0];
            return player;
        },
        canRemovePlayer(player) {
            return (
                pManager.ref_tourney.getMatchesByPlayer(
                    player,
                    null
                ).length > 0
            );
        },
        canRemovePlayerById(id) {
            return pManager.canRemovePlayer(pManager.getPlayerById(id));
        },
        setByIdList(playerManager, list) {
            const currentIds = pManager.roster.map((p) => p.id);
            const toAdd = list.filter((id) => !currentIds.includes(id));
            const toRemove = currentIds.filter((id) => !list.includes(id));
            toAdd.forEach((id) => pManager.importPlayerById(playerManager, id));
            toRemove.forEach((id) => pManager.removePlayerById(id));
            pManager.avoidList = playerManager.avoidList;
        },
        addPlayer(playerData) {
            if (!playerData.id) {
                playerData.id = pManager.lastId + 1;
            }
            if (playerData.id > pManager.lastId) {
                pManager.lastId = playerData.id;
            }
            let player = createPlayer(playerData);
            pManager.roster.push(player);
            return player;
        },
        addPlayers(playersData) {
            return playersData.map(
                (player) => pManager.addPlayer(player)
            );
        },
        loadPlayerData(data) {
            pManager.roster = data.map(
                (player) => createPlayer(player)
            );
        },
        delPlayer(playerId) {
            let index = pManager.roster.map(
                (p) => p.id
            ).indexOf(
                Number(playerId)
            );
            if (index === -1) {
                return null;
            }
            let player = pManager.roster.splice(index, 1);
            return player;
        },
        getPlayerAvoidList(player) {
            return pManager.avoidList.filter( // get pairings with the player
                (pair) => pair.includes(player.id)
            ).reduce( // Flatten the array
                (accumulator, pair) => pair.concat(accumulator),
                []
            ).filter( // filter out the player's id
                (id) => id !== player.id
            ).map( // turn the ids into player objects
                (id) => pManager.getPlayerById(id)
            );
        }
    };
    if (importObj.roster) {
        importObj.roster.forEach(function (player) {
            if (typeof player === "number") {
                pManager.importPlayerById(playerSource, player);
            } else {
                pManager.addPlayer(player);
            }
        });
    }
    return pManager;
}

export {createPlayerManager};