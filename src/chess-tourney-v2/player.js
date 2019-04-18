// @ts-check
import EloRank from "elo-rank";

function createPlayer(importObj = {}) {
    const player = {
        /** @type {number} */
        id: importObj.id || 0,
        firstName: importObj.firstName || "",
        lastName: importObj.lastName || "",
        rating: importObj.rating || 0,
        dummy: importObj.dummy || false,
        matchCount: importObj.matchCount || 0,
        getKFactor() {
            const ne = player.matchCount || 1;
            return (800 / ne);
        },
        getEloRank() {
            return new EloRank(player.getKFactor());
        }
    };
    return player;
}
export default Object.freeze(createPlayer);

const dummyPlayer = createPlayer();
dummyPlayer.id = -1;
dummyPlayer.firstName = "Bye";
dummyPlayer.dummy = true;
Object.freeze(dummyPlayer);
export {dummyPlayer};