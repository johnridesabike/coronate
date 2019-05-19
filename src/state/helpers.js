/**
 * @template {object} T
 * @param {string} key
 * @param {T} defaultValue
 * @returns {T}
 */
export function localStorageOrDefault(key, defaultValue) {
    if (process.env.NODE_ENV === "test") {
        return defaultValue; // don't store values during tests
    }
    const value = JSON.parse(localStorage.getItem(key)) || defaultValue;
    localStorage.setItem(key, JSON.stringify(value));
    return value;
}
