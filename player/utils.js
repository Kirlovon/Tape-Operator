// Logging utility
const logger = {
    info: (...args) => console.info('[Tape Operator Player]', ...args),
    warn: (...args) => console.warn('[Tape Operator Player]', ...args),
    error: (...args) => console.error('[Tape Operator Player]', ...args),
}

/**
 * Returns a hash code from a string
 * @param {string} str The string to hash
 * @return {number} A 32bit integer
 */
function hashCode(str) {
    let hash = 0;

    for (let i = 0, len = str.length; i < len; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }

    return Math.abs(hash);
}

/**
 * Update URL by setting a search parameter
 * @param {string} key
 * @param {string} value
 */
function setSearchParam(key, value) {
    const url = new URL(location.href);
    url.searchParams.set(key, value);
    history.replaceState(null, '', url.toString());
}

/**
 * Get search parameter from URL
 * @param {string} key
 * @return {string}
 */
function getSearchParam(key) {
    const url = new URL(location.href);
    return url.searchParams.get(key);
}

/**
 * Parse a version string into a number
 */
function parseVersion(version) {
    return parseInt(version.replace(/\D/g, ''));
}