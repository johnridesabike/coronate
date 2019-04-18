// @ts-check
import EloRank from "elo-rank";

function createPlayer() {
    const player = {
        id: 0,
        firstName: "",
        lastName: "",
        rating: 0,
        dummy: false,
        matchCount: 0,
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