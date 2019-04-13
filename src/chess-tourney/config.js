// @ts-check
/**
 * @typedef {import("./player").player} player
 */
/**
 * @typedef {Object} configItem
 * @property {string} name
 * @property {string} funcName
 * @property {boolean} active
 */
/**
 * @typedef {Object} configType
 * @property {configItem[]} tieBreak
 */
/**
 * @returns {configType}
 */
function createDefaultConfig() {
    /**
     * @type {configType}
     */
    const defaultConfig = {
        tieBreak: [
            {
                "name": "Modified median",
                "funcName": "modifiedMedian",
                "active": true
            },
            {
                "name": "Solkoff",
                "funcName": "solkoff",
                "active": true
            },
            {
                "name": "Cumulative score",
                "funcName": "playerScoreCum",
                "active": true
            },
            {
                "name": "Cumulative of opposition",
                "funcName": "playerOppScoreCum",
                "active": true
            },
            {
                "name": "Most black",
                "funcName": "playerColorBalance",
                "active": false
            }
        ]
    };
    return defaultConfig;
}

/**
 * @param {string} key
 * @param {*} value
 * @returns {*}
 */
function JSONretriever(key, value) {
    if (key.startsWith("ref_")) {
        return undefined;
    } else if (key === "roster" && Array.isArray(value)) {
        return value.map(
            /**
             * @param {player} p
             */
            (p) => p.id
        );
    } else {
        return value;
    }
}

export {
    JSONretriever,
    createDefaultConfig
};