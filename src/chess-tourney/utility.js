// @ts-check
/**
 * @param {number} playerCount
 */
function calcNumOfRounds(playerCount) {
    let roundId = Math.ceil(Math.log2(playerCount));
    if (!Number.isFinite(roundId)) {
        roundId = 0;
    }
    return roundId;
}
Object.freeze(calcNumOfRounds);
export {calcNumOfRounds};

/**
 * @param {Object[]} list
 * @param {number | string} id
 */
function getById(list, id) {
    return list.filter((x) => x.id === id)[0];
}
Object.freeze(getById);
export {getById};
/**
 * @param {Object[]} list
 * @param {number | string} id
 */
function getIndexById(list, id) {
    return list.indexOf(getById(list, id));
}
Object.freeze(getIndexById);
export {getIndexById};