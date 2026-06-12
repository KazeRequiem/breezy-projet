const db = require("../models");
const Message = db.Message;

exports.create = async (req, res) => {
    try {
        const { content, image_url, video_url } = req.body;

        if (!content || content.trim().lenght === 0) {
            return res.status(400).json({ message: "Le contenu est requis" });
        }

        if (content.length > 280) {
            return res.status(400).json({ message: "Le contenu ne peu pas dépasser 280 caractères" });
        }

        const message = await Message.create({
            content,
            image_url: image_url || null,
            video_url: video_url || null,
            id_user: req.user.id_user,
        });

        res.status(201).json(message);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};