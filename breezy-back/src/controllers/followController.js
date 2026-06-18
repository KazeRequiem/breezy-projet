const db = require("../models");
const Follow = db.Follow;

exports.follow = async (req, res) => {
    try {
        const follower = req.user.id;
        const following = req.params.id;

        if (follower === following) {
            return res.status(400).json({ message: "Vous ne pouvez pas vous suivre vous-même" });
        }

        const existing = await Follow.findOne({ follower, following });
        if (existing) {
            return res.status(409).json({ message: "Vous suivez déjà cet utilisateur" });
        }

        const follow = await Follow.create({ follower, following });
        res.status(201).json(follow);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.unfollow = async (req, res) => {
    try {
        const follower = req.user.id;
        const following = req.params.id;

        const result = await Follow.deleteOne({ follower, following });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Vous ne suivez pas cet utilisateur" });
        }

        res.status(200).json({ message: "Vous ne suivez plus cet utilisateur" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.getFollowers = async (req, res) => {
    try {
        const { id } = req.params;

        const followers = await Follow
            .find({ following: id })
            .populate("follower", "username profile_picture");

        res.status(200).json(followers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Liste des utilisateurs que :id suit
exports.getFollowing = async (req, res) => {
    try {
        const { id } = req.params;

        const following = await Follow
            .find({ follower: id })
            .populate("following", "username profile_picture");

        res.status(200).json(following);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};