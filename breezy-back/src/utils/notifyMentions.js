const db = require("../models");
const User = db.User;
const notify = require("./notify");

const MENTION_REGEX = /@([a-zA-Z0-9_]+)/g;

async function notifyMentions(content, senderId, messageId) {
    try {
        if (typeof content !== "string") return;

        const usernames = [...new Set(
            [...content.matchAll(MENTION_REGEX)].map((m) => m[1])
        )];

        if (usernames.length === 0) return;

        const users = await User.find({ username: { $in: usernames } });

        await Promise.all(
            users.map((u) =>
                notify({
                    recipient: u._id,
                    sender: senderId,
                    type: "mention",
                    message: messageId,
                })
            )
        );
    } catch (err) {
        // secondary : we log but don't propagate
        console.error("notifyMentions: échec de la notification des mentions:", err.message);
    }
}

module.exports = notifyMentions;