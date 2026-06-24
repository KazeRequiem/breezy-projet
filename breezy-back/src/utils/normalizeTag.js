// 1 tag : trim + lowercase
function normalizeTag(tag) {
    return String(tag).trim().toLowerCase();
}

function normalizeTags(tags) {
    if (!Array.isArray(tags)) {
        return [];
    }

    const normalized = tags
        .map((t) => normalizeTag(t))
        .filter((t) => t.length > 0);

    // duplication
    return [...new Set(normalized)];
}

module.exports = { normalizeTag, normalizeTags };