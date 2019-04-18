// @ts-check
function createTournament() {
    const tourney = {
        /** @type {object[][]} */
        roundList: [],
        /** @type {number[]} */
        byeQueue: [],
        /** @type {number} */
        byeValue: 1,
        /** @type {number[]} */
        rosterActive: [],
        /** @type {number[]} */
        rosterAll: []
    };
    return tourney;
}
export default Object.freeze(createTournament);