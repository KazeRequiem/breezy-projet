const db = require("../models");
const { publicUser, selfUser } = require("../utils/publicUser");

const User = db.User;
const Follow = db.Follow;
const Message = db.Message;

exports.search = async (req, res) => {
    try {
        const q = (req.query.q || "").trim();
        if (q.length === 0) {
            return res.status(200).json([]);
        }

        // éviter les injections
        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const users = await User.find({
            username: { $regex: escaped, $options: "i" },
        })
            .select("username profile_picture biography")
            .limit(5);

        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};


exports.getByUsername = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .collation({ locale: "en", strength: 2 });

        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        const [followersCount, followingCount, messagesCount] = await Promise.all([
            Follow.countDocuments({ following: user._id }),
            Follow.countDocuments({ follower: user._id }),
            Message.countDocuments({ author: user._id }),
        ]);

        res.status(200).json({
            ...publicUser(user),
            followersCount,
            followingCount,
            messagesCount,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// PUT /api/users/me — mise à jour du profil de l'utilisateur connecté
exports.updateProfile = async (req, res) => {
    try {
        const { username, biography, profile_picture, tags } = req.body;
        const updates = {};

        if (username !== undefined) {
            const u = String(username).trim();
            if (!u) return res.status(400).json({ message: "Le nom d'utilisateur ne peut pas être vide" });
            if (!/^[a-zA-Z0-9_]+$/.test(u)) {
                return res.status(400).json({ message: "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores" });
            }
            updates.username = u;
        }
        if (biography !== undefined) updates.biography = biography || null;
        if (profile_picture !== undefined) updates.profile_picture = profile_picture || null;
        if (tags !== undefined) {
            updates.tags = Array.isArray(tags)
                ? [...new Set(tags.map((t) => String(t).trim().replace(/^#/, "").toLowerCase()).filter(Boolean))]
                : [];
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true }
        );
        if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

        res.status(200).json(selfUser(user));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};