const db = require("../models");
const { publicUser } = require("../utils/publicUser");

const User = db.User;
const Follow = db.Follow;
const Message = db.Message;

/**
 * GET /api/users/search?q=...
 * Recherche des utilisateurs par nom d'utilisateur (autocomplétion).
 */
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
            .limit(10);

        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};


/**
 * GET /api/users/:username
 * Retourne le profil public d'un utilisateur (sans le mot de passe).
 */
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
