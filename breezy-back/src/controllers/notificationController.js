const db = require("../models");
const Notification = db.Notification;

// GET /notifications — my notif, most recent first
exports.getMine = async (req, res) => {
    try {
        const notifications = await Notification
            .find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .populate("sender", "username profile_picture");

        res.status(200).json(notifications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// PATCH /notifications/:id/read — mark 1 notification as read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: "Notification introuvable" });
        }

        if (notification.recipient.toString() !== req.user.id) {
            return res.status(403).json({ message: "Action non autorisée" });
        }

        const updated = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );
        res.status(200).json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// PATCH /notifications/read-all — mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        const result = await Notification.updateMany(
            { recipient: req.user.id, read: false },
            { read: true }
        );
        res.status(200).json({ message: "Notifications marquées comme lues", modifiedCount: result.modifiedCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};