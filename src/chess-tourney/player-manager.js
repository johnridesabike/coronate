// @ts-check
import {createPlayer, dummyPlayer} from "./player";
/**
 * @typedef {import("./tournament").tournament} tournament
 * @typedef {import("./player").player} player
 * @typedef {import("./player").playerProps} playerProps
 */
/**
 * @typedef {Object} playerManager
 * @property {Array<player>} roster
 * @property {number} lastId
 * @property {?tournament} ref_tourney
 * @property {Array<player>} inactive
 * @property {function(): Array<player>} getActive
 * @property {function(playerManager, number)} importPlayerById
 * @property {function(Array<player>)} importPlayerList
 * @property {function(player)} deactivatePlayer
 * @property {function(player)} activatePlayer
 * @property {function(player)} removePlayer
 * @property {function(number)} removePlayerById
 * @property {function(number)} getPlayerById
 * @property {function(player): boolean} canRemovePlayer
 * @property {function(number): boolean} canRemovePlayerById
 * @property {function(playerManager, Array<number>)} setByIdList
 * @property {function(playerProps)} addPlayer
 * @property {function(Array<playerProps>)} addPlayers
 * @property {function(Array<playerProps>)} loadPlayerData
 * @property {function(number)} delPlayer
 */
/**
 * @typedef {Object} playerManagerProps
 * @property {Array<player>} roster
 * @property {number} lastId
 * @property {?tournament} ref_tourney
 * @property {Array<player>} inactive
 */

/**
 * @type {playerManagerProps}
 */
const defPManager = {
    roster: [],
    lastId: -1,
    ref_tourney: null,
    inactive: []
};

/**
 *
 * @param {playerManagerProps} importObj
 * @param {?playerManager} playerSource
 * @returns {playerManager}
 */
function createPlayerManager(importObj = defPManager, playerSource = null) {
    /**
     * @type {playerManager}
     */
    const pManager = {
        roster: [],
        lastId: importObj.lastId || defPManager.lastId,
        ref_tourney: importObj.ref_tourney || defPManager.ref_tourney,
        inactive: importObj.inactive || defPManager.inactive,
        getActive() {
            return pManager.roster.filter(
                (i) => !pManager.inactive.includes(i)
            );
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
        },
        addPlayer(playerData) {
            playerData.id = pManager.lastId + 1;
            pManager.lastId = playerData.id;
            let player = createPlayer(playerData);
            pManager.roster.push(player);
            return player;
        },
        addPlayers(playersData) {
            let newPlayerList = playersData.map(
                (player) => pManager.addPlayer(player)
            );
            return newPlayerList;
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

/**
 * Prepares a raw list of player data to be used in `createPlayerManager`
 * @param {Object[]} list
 * @returns {playerManagerProps}
 */
function playerList(list) {
    const newObs = Object.create(defPManager);
    newObs.roster = list;
    return newObs;
}

export {createPlayerManager, playerList};