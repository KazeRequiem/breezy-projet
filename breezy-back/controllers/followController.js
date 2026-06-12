const db = require("../models");
const message = require("../models/message");
const Follow = db.Follow;

exports.follow = async (req, res) => {
    try {
        const { id_user_follow } = req.params;
        const id_user = req.user.id_user;

        //Check that we can't follow ourself
        if (String(id_user) === String(id_user_follow)) {
            return res.status(400).json({ message: "Vous ne pouvez pas vous suivre vous même" });
        }

        //Check that we don't follow this user
        const existing = await Follow.findOne({
            where: { id_user, id_user_follow },
        }),
        if (existing) {
            return res.status(409).json({ message: "Vous suivez déjà cet.te Utilisateur.ice" })
        }

        await Follow.create({ id_user, id_user_follow });
        res.status.json({ message: "UTilisateur.ice suivi.e" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur Serveur" });
    }
};

exports.unfollow = async (req, res) => {
    try {
        const { id_user_follow } = req.params;
        const id_user = res.user.id_user;

        const deleted = await Follow.destroy({
            where: { id_user, id_user_follow },
        });

        if (deleted === 0) {
            return res.status(404).json({ messsage: "Vous ne suivez pas cet.te utilisateur.ice" });
        }

        res.status(200).json({ message: "Vous ne suivez plus cet.te utilisateur.ice" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur Serveur" });
    }
};