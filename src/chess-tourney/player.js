import EloRank from "elo-rank";

/**
 * Represents an indivudal player. Call it with `createPlayer("John", ...)` or
 * `createPlayer({firstName: "John", ...})`. The latter is convenient for
 * converting JSON objects.
 * @param {object} firstName Either the person's first name or an object
 * containing all the parameters.
 * @param {string} lastName  The person's last name.
 * @param {int}    rating    The person's Elo rating.
 */
function createPlayer(importObj = {}) {
    const player = {
        /**
         * @property {number} id The ID number of the player. Used mainly for
         * JSON serialization.
         */
        id: importObj.id || 0,
        /**
         * @property {string} firstName The person's first name.
         */
        firstName: importObj.firstName || "",
        /**
         * @property {string} lastName The person's last name.
         */
        lastName: importObj.lastName || "",
        /**
         * @property {number} rating The person's Elo rating.
         */
        rating: importObj.rating || 0,
        /**
         * @property {bool} dummy If true, this player won't count in certain
         * scorings.
         */
        dummy: importObj.dummy || false,
        /**
         * @property {number} matchCount Number of games the rating is based on.
         */
        matchCount: importObj.matchCount || 0,
        /**
         * Create an Elo calculator with an updated K-factor. See the `elo-rank`
         * NPM package for more information.
         * @param {object} tourney The current tournament.
         * @returns {object} An `EloRank` object.
         */
        getEloRank() {
            const ne = player.matchCount || 1;
            const K = (800 / ne);
            return new EloRank(K);
        },
        /**
         * Get if a player has had a bye round.
         * @param {object} tourney The current tournament.
         * @returns {bool} True if the player has had a bye round, false if not.
         * TODO: move this to the tournament object?
         */
        hasHadBye(tourney) {
            return tourney.getPlayersByOpponent(player).includes(dummyPlayer);
        },
        toJSON(key) {
            if (key && player.isReference) {
                return player.id;
            } else {
                return player;
            }
        }
    };
    return player;
}

/**
 * A stand-in for bye matches.
 * @constant {object} dummyPlayer
 */
const dummyPlayer = Object.freeze(
    createPlayer(
        {
            id: -1,
            firstName: "Bye",
            dummy: true,
            rating: 0
        }
    )
);

function createPlayerManager(importObj = {}, playerSource = null) {
    const roster = {
        roster: [], // this gets added later
        lastId: importObj.lastId || -1,
        /**
         * @property {object} ref_tourney A reference to the tournemnt
         * containing this match.
         */
        ref_tourney: importObj.tourney || null,
        /**
         * @param {array} inactive A list of the players who won't be paired in
         * future rounds.
         */
        inactive: [],
        /**
         * Get a list of players to be paired.
         * @returns {array} A list of the active players.
         */
        getActive() {
            return roster.roster.filter((i) => !roster.inactive.includes(i));
        },
        importPlayerById(fromRoster, playerId) {
            let player = fromRoster.getPlayerById(playerId);
            roster.roster.push(player);
            return roster;
        },
        importPlayerIdsList(playerIdList) {
            playerIdList.map((id) => roster.importPlayer(id));
            return roster;
        },
        importPlayerList(playerList) {
            roster.roster = playerList;
            return roster;
        },
        /**
         * Remove a player from the active roster. This player won't be placed
         * in future rounds.
         * @param {object} player The player object.
         * @returns {object} This roster object.
         */
        deactivatePlayer(player) {
            roster.inactive.push(player);
            return roster;
        },
        /**
         * Move an inactive player to the active roster to be placed in future
         * rounds.
         * @param {object} player The player object.
         * @returns {object} This roster object.
         */
        activatePlayer(player) {
            roster.inactive.splice(roster.inactive.indexOf(player), 1);
            return roster;
        },
        /**
         * Remove a player from the roster completely.
         * @param {object} player The player object.
         * @returns {object} This roster object.
         */
        removePlayer(player) {
            if (roster.canRemovePlayer(player)) {
                return null; // TODO: add a helpful error message
            }
            delete roster.roster[roster.roster.indexOf(player)];
            return roster;
        },
        removePlayerById(playerId) {
            roster.removePlayer(roster.getPlayerById(playerId));
            return roster;
        },
        getPlayerById(id) {
            if (id === -1) {
                return dummyPlayer;
            }
            return roster.roster.filter((p) => p.id === id)[0];
        },
        canRemovePlayer(player) {
            return (roster.ref_tourney.getMatchesByPlayer(player).length > 0);
        },
        canRemovePlayerById(id) {
            return roster.canRemovePlayer(roster.getPlayerById(id));
        },
        setByIdList(playerManager, list) {
            const currentIds = roster.roster.map((p) => p.id);
            const toAdd = list.filter((id) => !currentIds.includes(id));
            const toRemove = currentIds.filter((id) => !list.includes(id));
            toAdd.forEach((id) => roster.importPlayerById(playerManager, id));
            toRemove.forEach((id) => roster.removePlayerById(id));
        },
        /**
         * Add a player to the roster.
         * @param {object} player The player object to add.
         * @returns {object} This created player object.
         */
        addPlayer(playerData) {
            playerData.id = roster.lastId + 1;
            roster.lastId = playerData.id;
            let player = createPlayer(playerData);
            roster.roster.push(player);
            return player;
        },
        /**
         * Add a list of players to the roster.
         * @param {array} players A list of players to add.
         * @returns {array} The list of created player objects.
         */
        addPlayers(playersData) {
            let newPlayerList = playersData.map(
                (player) => roster.addPlayer(player)
            );
            return newPlayerList;
        },
        loadPlayerData(data) {
            roster.roster = data.map(
                (player) => createPlayer(player)
            );
        },
        delPlayer(playerId) {
            let index = roster.roster.map(
                (p) => p.id
            ).indexOf(
                Number(playerId)
            );
            if (index === -1) {
                return null;
            }
            let player = roster.roster.splice(index, 1);
            return player;
        }
    };
    if (importObj.roster) {
        importObj.roster.forEach(function (player) {
            if (typeof player === "number") {
                roster.importPlayerById(playerSource, player);
            } else {
                roster.addPlayer(player);
            }
        });
    }
    return roster;
}

export {dummyPlayer, createPlayer, createPlayerManager};