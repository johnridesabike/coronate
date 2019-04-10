import config from "./default-config.json";

/**
 * Moves a specific tie-break method to a new priority.
 * @function moveTieBreak
 * @param {number} methodId The key ID for the target tie-break method.
 * @param {number} newPos The new position to move the method do.
 * @returns {?array} The modified array of tie-break methods if successful, or
 * null on failure.
 */
config.moveTieBreak = function (methodId, newPos) {
    if (newPos < 0 || newPos > config.tieBreak.length - 1) {
        return null;
    }
    if (!config.tieBreak[methodId]) {
        return null;
    }
    let movedMethod = config.tieBreak.splice(methodId, 1)[0];
    config.tieBreak.splice(newPos, 0, movedMethod);
    return config.tieBreak;
};

/**
 * Removes circular references with `JSON.stringify()`.
 */
config.noCircRefs = function (key, value) {
    if (key.startsWith("ref_")) {
        return undefined;
    } else {
        return value;
    }
};


export default Object.freeze(config);