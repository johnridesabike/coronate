/**
 * @template {object} T
 * @param {string} key
 * @param {T} defaultValue
 * @returns {T}
 */
export function localStorageOrDefault(key, defaultValue) {
    return defaultValue;
    const value = JSON.parse(localStorage.getItem(key)) || defaultValue;
    localStorage.setItem(key, JSON.stringify(value));
    return value;
}
