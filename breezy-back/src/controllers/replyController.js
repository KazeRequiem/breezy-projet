const db = require("../models");
const Message = db.Message;
const Reply = db.Reply;

exports.create = async (req, res) => {
    try {
        const parentId = req.params.id;

        // 404 : le message parent doit exister
        const parent = await Message.findById(parentId);
        if (!parent) {
            return res.status(404).json({ message: "Message introuvable" });
        }

        const { content } = req.body;
        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: "Le contenu est requis" });
        }
        if (content.length > 280) {
            return res.status(400).json({ message: "Le contenu ne peut pas dépasser 280 caractères" });
        }

        const message = await Message.create({
            content,
            author: req.user.id,
        });

        const reply = await Reply.create({
            message: parentId,
            reply: message._id,
        });

        res.status(201).json({ message, reply });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.getByMessage = async (req, res) => {
    try {
        const replies = await Reply
            .find({ message: req.params.id })
            .populate({
                path: "reply",
                populate: { path: "author", select: "username profile_picture" },
            });

        const messages = replies.map((r) => r.reply);

        res.status(200).json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};