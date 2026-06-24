const db = require("../models");
const Whisper = db.Whisper;
const Message = db.Message;

// POST /messages/:id/whispers — whisper a private message on a post (Fx17)
exports.create = async (req, res) => {
    try {
        const messageId = req.params.id;

        // 404 : target message must exist
        const target = await Message.findById(messageId);
        if (!target) {
            return res.status(404).json({ message: "Message introuvable" });
        }

        const { content } = req.body;
        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: "Le contenu est requis" });
        }
        if (content.length > 280) {
            return res.status(400).json({ message: "Le contenu ne peut pas dépasser 280 caractères" });
        }

        const whisper = await Whisper.create({
            content,
            author: req.user.id,
            message: messageId,
        });

        res.status(201).json(whisper);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// GET /messages/:id/whispers — list all the whisper
// Rules :
//   - author of the message  -> see all of his whisper on a message
//   - other user  -> see only his whisper on a message
exports.getByMessage = async (req, res) => {
    try {
        const messageId = req.params.id;

        // 404 : message must exist (to know it author)
        const target = await Message.findById(messageId);
        if (!target) {
            return res.status(404).json({ message: "Message introuvable" });
        }

        const filter = { message: messageId };

        const isMessageAuthor = target.author.toString() === req.user.id;
        if (!isMessageAuthor) {
            filter.author = req.user.id;
        }

        const whispers = await Whisper
            .find(filter)
            .populate("author", "username profile_picture");

        res.status(200).json(whispers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// DELETE /whispers/:id — delete our own whisper
exports.remove = async (req, res) => {
    try {
        const whisper = await Whisper.findById(req.params.id);
        if (!whisper) {
            return res.status(404).json({ message: "Whisper introuvable" });
        }

        // seul l'auteur du whisper peut le supprimer
        if (whisper.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "Action non autorisée" });
        }

        await Whisper.deleteOne({ _id: whisper._id });
        res.status(200).json({ message: "Whisper supprimé" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};