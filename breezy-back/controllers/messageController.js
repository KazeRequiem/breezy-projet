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

exports.getByUser = async (req,res) =>{
    try{
        const {id_user}= req.params;

        const messages = await Message.findAll({
            where: {id_user},
            order: [["date publication","DESC"]] //Filter to have the most recent in first
        });

        res.status(200).json(messages);
    }catch(err) {
        console.error(err);
        res.status(500).json({message: "Erreur serveur"});
    }
};