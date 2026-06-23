const db = require("../models");
const Message = db.Message;
const Reply = db.Reply;

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

    // Exclure les messages qui sont en réalité des réponses (présents dans Reply.reply)
    const replyIds = await Reply.distinct("reply");
    filter._id = { $nin: replyIds };

    const messages = await Message
        .find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("author", "username profile_picture");

    // Compter les réponses de chaque message de la page
    const ids = messages.map((m) => m._id);
    const counts = await Reply.aggregate([
        { $match: { message: { $in: ids } } },
        { $group: { _id: "$message", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

    return messages.map((m) => ({
        ...m.toObject(),
        replies_count: countMap.get(String(m._id)) || 0,
    }));
}

module.exports = { paginateMessages };
