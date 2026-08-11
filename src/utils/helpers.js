function sanitizeString(value, fallback = '') {
    if (typeof value !== 'string') return fallback;
    const clean = value.trim().slice(0, 250);
    return clean || fallback;
}

function parseNumber(value, fallback = 0) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
}

module.exports = {
    sanitizeString,
    parseNumber
};
