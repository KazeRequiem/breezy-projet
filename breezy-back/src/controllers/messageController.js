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

// PATCH /messages/:id - only author can modify (content + tags)
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

// DELETE /messages/:id — Author OR a moderator/admin
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

// GET /messages/explore?limit=20&before=<date> — All the message (discovery)
exports.explore = async (req, res) => {
    try {
        const filter = {};

        // Curseur : if before is an old date, we only take the oldest
        if (req.query.before) {
            const beforeDate = new Date(req.query.before);
            if (!isNaN(beforeDate.getTime())) {
                filter.createdAt = { $lt: beforeDate };
            }
            // invalide before -> ignored (fallback : most recent)
        }

        // limit demandé, plafonné à 20 (défaut 20 aussi)
        const requested = parseInt(req.query.limit, 10);
        const limit = Math.min(Number.isNaN(requested) ? 20 : requested, 20);

        const messages = await Message
            .find(filter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate("author", "username profile_picture");

        res.status(200).json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};