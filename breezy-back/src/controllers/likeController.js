const db = require("../models");
const Like = db.Like;
const Message = db.Message;

exports.like = async (req, res) => {
    try {
        const user = req.user.id;
        const message = req.params.messageId;

        const existingMessage = await Message.findById(message);
        if (!existingMessage) {
            return res.status(404).json({ message: "Message introuvable" });
        }

        const existing = await Like.findOne({ user, message });
        if (existing) {
            return res.status(409).json({ message: "Vous avez déjà liké ce message" });
        }

        const like = await Like.create({ user, message });
        res.status(201).json(like);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.unlike = async (req, res) => {
    try {
        const user = req.user.id;
        const message = req.params.messageId;

        const result = await Like.deleteOne({ user, message });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Vous n'avez pas liké ce message" });
        }

        res.status(200).json({ message: "Like retiré" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.getByMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        const likes = await Like
            .find({ message: messageId })
            .populate("user", "username profile_picture");

        res.status(200).json(likes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.getStatus = async (req, res) => {
    try {
        const message = req.params.messageId;
        const user = req.user.id;

        const [likesCount, myLike] = await Promise.all([
            Like.countDocuments({ message }),
            Like.findOne({ message, user }),
        ]);

        res.status(200).json({
            likesCount,
            likedByMe: !!myLike,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};