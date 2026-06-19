const db = require("../models");
const User = db.User;

/**
 * GET /api/users/:username
 * Retourne le profil public d'un utilisateur (sans le mot de passe).
 */
exports.getByUsername = async (req, res) => {
    try {
        const user = await User.findOne(
            { username: { $regex: new RegExp(`^${req.params.username}$`, "i") } },
            { password: 0 } // exclure le mot de passe
        );

        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            bio: user.biography,
            profile_picture: user.profile_picture,
            role: user.role,
            tags: user.tags,
            createdAt: user.createdAt,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
