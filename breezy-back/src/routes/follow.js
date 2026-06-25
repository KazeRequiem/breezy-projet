const express = require("express");
const router = express.Router();
const followController = require("../controllers/followController");
const verifyToken = require("../middlewares/auth");

/**
 * @swagger
 * /api/follow/{id}:
 *   post:
 *     summary: Suivre un utilisateur
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID de l'utilisateur à suivre
 *     responses:
 *       201: { description: Abonnement créé }
 *       400: { description: On ne peut pas se suivre soi-même }
 *       409: { description: Déjà abonné }
 *   delete:
 *     summary: Ne plus suivre un utilisateur
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Abonnement supprimé }
 *       404: { description: Vous ne suivez pas cet utilisateur }
 */
router.post("/:id", verifyToken, followController.follow);
router.delete("/:id", verifyToken, followController.unfollow);

/**
 * @swagger
 * /api/follow/{id}/followers:
 *   get:
 *     summary: Liste des abonnés d'un utilisateur
 *     tags: [Follow]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Liste des abonnés }
 */
router.get("/:id/followers", followController.getFollowers);

/**
 * @swagger
 * /api/follow/{id}/following:
 *   get:
 *     summary: Liste des abonnements d'un utilisateur
 *     tags: [Follow]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Liste des utilisateurs suivis }
 */
router.get("/:id/following", followController.getFollowing);

module.exports = router;