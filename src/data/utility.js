/**
 * @param {number} playerCount
 */
export function calcNumOfRounds(playerCount) {
    let roundId = Math.ceil(Math.log2(playerCount));
    if (!Number.isFinite(roundId)) {
        roundId = 0;
    }
    return roundId;
}

/**
 * @template {object} T
 * @param {T[]} list
 * @param {number | string} id
 * @returns {T}
 */
export function getById(list, id) {
    return list.filter((x) => x.id === id)[0];
}

/**
 * @param {Object[]} list
 * @param {number | string} id
 */
export function getIndexById(list, id) {
    return list.indexOf(getById(list, id));
}
