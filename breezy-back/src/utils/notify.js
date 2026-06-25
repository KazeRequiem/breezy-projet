const db = require("../models");
const Notification = db.Notification;

async function notify({ recipient, sender, type, message = null }) {
    try {
        // we don't notify ourself
        if (String(recipient) === String(sender)) {
            return;
        }

        await Notification.create({ recipient, sender, type, message });
    } catch (err) {
        // secondary : we log but do not propagade the error
        console.error("notify: échec de la création de la notification:", err.message);
    }
}

module.exports = notify;