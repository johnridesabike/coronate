// @ts-check
import EloRank from "elo-rank";
/**
 * @typedef { import("./tournament").tournament } tournament
 */
/**
 * @typedef {Object} player
 * @property {number} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {number} rating
 * @property {boolean} dummy
 * @property {number} matchCount
 * @property {function(): Object} getEloRank
 * @property {function(tournament): boolean} hasHadBye
 */
/**
 * @typedef {Object} defaultPlayer
 * @property {number} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {number} rating
 * @property {boolean} dummy
 * @property {number} matchCount
 */

/**
 * @type {defaultPlayer}
 */
const defPlayer = {
    id: 0,
    firstName: "",
    lastName: "",
    rating: 0,
    dummy: false,
    matchCount: 0
};

/**
 *
 * @param {defaultPlayer} importObj
 * @returns {player}
 */
function createPlayer(importObj = defPlayer) {
    /**
     * @type {player}
     */
    const newPlayer = {
        id: importObj.id || defPlayer.id,
        firstName: importObj.firstName || defPlayer.firstName,
        lastName: importObj.lastName || defPlayer.lastName,
        rating: importObj.rating || defPlayer.rating,
        dummy: importObj.dummy || defPlayer.dummy,
        matchCount: importObj.matchCount || defPlayer.matchCount,
        getEloRank() {
            const ne = newPlayer.matchCount || 1;
            const K = (800 / ne);
            return new EloRank(K);
        },
        hasHadBye(tourney) {
            return tourney.getPlayersByOpponent(
                newPlayer,
                null
            ).includes(dummyPlayer);
        }
    };
    return newPlayer;
}

/**
 * @type {player}
 */
const dummyPlayer = createPlayer();
dummyPlayer.id = -1;
dummyPlayer.firstName = "Bye";
dummyPlayer.dummy = true;
Object.freeze(dummyPlayer);

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
 * @property {function(defaultPlayer)} addPlayer
 * @property {function(Array<defaultPlayer>)} addPlayers
 * @property {function(Array<defaultPlayer>)} loadPlayerData
 * @property {function(number)} delPlayer
 */
/**
 * @typedef {Object} defaultPlayerManager
 * @property {Array<player>} roster
 * @property {number} lastId
 * @property {?tournament} ref_tourney
 * @property {Array<player>} inactive
 */

/**
 * @type {defaultPlayerManager}
 */
const defPManager = {
    roster: [],
    lastId: -1,
    ref_tourney: null,
    inactive: []
};

/**
 *
 * @param {defaultPlayerManager} importObj
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

export {dummyPlayer, createPlayer, createPlayerManager, defPManager};