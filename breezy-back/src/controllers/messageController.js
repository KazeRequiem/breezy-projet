const db = require("../models");
const Message = db.Message;
const User = db.User;

exports.create = async (req, res) => {
    try {
        const { content, image_url, video_url, tags } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: "Le contenu est requis" });
        }

        if (content.length > 280) {
            return res.status(400).json({ message: "Le contenu ne peut pas dépasser 280 caractères" });
        }

        const message = await Message.create({
            content,
            image_url: image_url || null,
            video_url: video_url || null,
            tags: Array.isArray(tags) ? tags : [],
            author: req.user.id,
        });

        res.status(201).json(message);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.getByUser = async (req, res) => {
    try {
        const { id_user } = req.params;

        const messages = await Message
            .find({ author: id_user })
            .sort({ createdAt: -1 }); // -1 = most recent first

        res.status(200).json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.getByUsername = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        const messages = await Message
            .find({ author: user._id })
            .sort({ createdAt: -1 });

        res.status(200).json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.update = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ message: "Message introuvable" });
        }

        if (message.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "Vous ne pouvez modifier que vos propres messages" });
        }

        const { content, tags } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: "Le contenu est requis" });
        }
        if (content.length > 280) {
            return res.status(400).json({ message: "Le contenu ne peut pas dépasser 280 caractères" });
        }

        const updated = await Message.findByIdAndUpdate(
            req.params.id,
            {
                content,
                tags: Array.isArray(tags) ? tags : message.tags,
            },
            { new: true }
        );

        res.status(200).json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.remove = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ message: "Message introuvable" });
        }

        const isAuthor = message.author.toString() === req.user.id;
        const isModerator = req.user.role === "moderator" || req.user.role === "admin";

        if (!isAuthor && !isModerator) {
            return res.status(403).json({ message: "Action non autorisée" });
        }

        await Message.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: "Message supprimé" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};