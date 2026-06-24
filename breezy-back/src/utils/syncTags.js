const db = require("../models");
const Tag = db.Tag;
const { normalizeTags } = require("./normalizeTag");

async function syncTags(tags) {
    const normalized = normalizeTags(tags);

    if (normalized.length === 0) {
        return normalized;
    }

    try {
        await Promise.all(
            normalized.map((name) =>
                Tag.updateOne(
                    { name },
                    { $setOnInsert: { name } },
                    { upsert: true }
                )
            )
        );
    } catch (err) {
        // Secondary : we log but we do not propagate the error.
        console.error("syncTags: échec de la synchro de la collection Tag:", err.message);
    }

    return normalized;
}

module.exports = { syncTags };