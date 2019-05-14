/**
 * @typedef {import("./index").Tournament} Tournament
 */
/**
 * @param {Object} importObj
 */
export default function createTournament(importObj) {
    /** @type {Tournament} */
    const tourney = {
        name: importObj.name || "",
        tieBreaks: importObj.tieBreaks || [0, 1, 2, 3],
        byeQueue: importObj.byeQueue || [],
        players: importObj.players || [],
        roundList: importObj.roundList || []
    };
    return tourney;
}
