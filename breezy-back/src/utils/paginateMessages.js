const db = require("../models");
const Message = db.Message;

async function paginateMessages(baseFilter, query) {
    const filter = { ...baseFilter };

    // Curseur "before" : we only keep the oldest messages (if date correct)
    if (query.before) {
        const beforeDate = new Date(query.before);
        if (!Number.isNaN(beforeDate.getTime())) {
            filter.createdAt = { $lt: beforeDate };
        }
        // invalide before -> ignored (fallback : most recent)
    }

    // limit at 20 (default 20)
    const requested = Number.parseInt(query.limit, 10);
    const limit = Math.min(Number.isNaN(requested) ? 20 : requested, 20);

    return Message
        .find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("author", "username profile_picture");
}

module.exports = { paginateMessages };