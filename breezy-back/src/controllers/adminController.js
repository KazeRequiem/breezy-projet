const db = require("../models");
const Message = db.Message;
const User = db.User;
const Report = db.Report;

const ROLES = ["user", "moderator", "admin"];

// GET /api/admin/messages — modération : liste des messages triés par nb de signalements
exports.listMessages = async (req, res) => {
    try {
        const messages = await Message
            .find({})
            .sort({ createdAt: -1 })
            .limit(100)
            .populate("author", "username role");

        // Nombre de signalements par message
        const ids = messages.map((m) => m._id);
        const counts = await Report.aggregate([
            { $match: { message: { $in: ids } } },
            { $group: { _id: "$message", count: { $sum: 1 } } },
        ]);
        const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

        const formatted = messages.map((m) => ({
            id_message: m._id,
            content: m.content,
            date_publication: m.createdAt,
            reports_count: countMap.get(String(m._id)) || 0,
            author: m.author
                ? { id: m.author._id, username: m.author.username, role: m.author.role }
                : null,
        }));

        // Tri : plus signalés d'abord, puis plus récents
        formatted.sort((a, b) =>
            b.reports_count - a.reports_count ||
            new Date(b.date_publication) - new Date(a.date_publication)
        );

        res.status(200).json(formatted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// GET /api/admin/users — liste des utilisateurs (admin)
exports.listUsers = async (req, res) => {
    try {
        const users = await User.find({}, "username email role suspended createdAt").sort({ createdAt: -1 });
        const formatted = users.map((u) => ({
            id: u._id,
            username: u.username,
            email: u.email,
            role: u.role,
            suspended: !!u.suspended,
            createdAt: u.createdAt,
        }));
        res.status(200).json(formatted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// PATCH /api/admin/users/:id/role — changer le rôle (admin)
exports.updateRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!ROLES.includes(role)) {
            return res.status(400).json({ message: "Rôle invalide" });
        }
        if (req.params.id === req.user.id) {
            return res.status(403).json({ message: "Vous ne pouvez pas modifier votre propre rôle" });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { role } },
            { new: true, projection: { username: 1, role: 1 } }
        );
        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }
        res.status(200).json({ id: user._id, username: user.username, role: user.role });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// PATCH /api/admin/users/:id/suspend — suspendre/réactiver (admin + modérateur)
exports.toggleSuspend = async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(403).json({ message: "Vous ne pouvez pas vous suspendre vous-même" });
        }

        const target = await User.findById(req.params.id);
        if (!target) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        // Un modérateur ne peut suspendre que des utilisateurs simples
        if (req.user.role === "moderator" && target.role !== "user") {
            return res.status(403).json({ message: "Privilèges insuffisants pour ce compte" });
        }

        const suspended = typeof req.body.suspended === "boolean" ? req.body.suspended : !target.suspended;
        target.suspended = suspended;
        await target.save();

        res.status(200).json({ id: target._id, username: target.username, suspended: target.suspended });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
