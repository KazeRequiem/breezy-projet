const db = require("../models");
const { publicUser } = require("../utils/publicUser");

const User = db.User;
const Follow = db.Follow;
const Message = db.Message;

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
