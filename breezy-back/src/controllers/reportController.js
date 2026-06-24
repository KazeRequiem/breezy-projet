const db = require("../models");
const Report = db.Report;
const Message = db.Message;

// POST /reports/:messageId - warn a message (Fx20)
exports.report = async (req, res) => {
    try {
        const user = req.user.id;
        const message = req.params.messageId;

        // 404 strict : message must exist
        const existingMessage = await Message.findById(message);
        if (!existingMessage) {
            return res.status(404).json({ message: "Message introuvable" });
        }

        // 409 : un user ne peut signaler qu'une fois le même message
        const existing = await Report.findOne({ user, message });
        if (existing) {
            return res.status(409).json({ message: "Vous avez déjà signalé ce message" });
        }

        const report = await Report.create({ user, message });
        res.status(201).json(report);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// GET /reports — tableau de bord modération : messages signalés groupés + compteur
exports.getReports = async (req, res) => {
    try {
        const reports = await Report.aggregate([
            { $group: { _id: "$message", reportsCount: { $sum: 1 } } },
            { $sort: { reportsCount: -1 } },
            {
                $lookup: {
                    from: "messages",
                    localField: "_id",
                    foreignField: "_id",
                    as: "message",
                },
            },
            { $unwind: "$message" },
            {
                $lookup: {
                    from: "users",
                    localField: "message.author",
                    foreignField: "_id",
                    as: "author",
                },
            },
            { $unwind: "$author" },
            {
                $project: {
                    _id: 1,
                    reportsCount: 1,
                    "message.content": 1,
                    "message.createdAt": 1,
                    "author._id": 1,
                    "author.username": 1,
                },
            },
        ]);

        res.status(200).json(reports);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// DELETE /reports/:messageId - resolve : suppress all warn on a message
exports.dismiss = async (req, res) => {
    try {
        const result = await Report.deleteMany({ message: req.params.messageId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Aucun signalement à traiter" });
        }
        res.status(200).json({ message: "Signalements traités", deletedCount: result.deletedCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};