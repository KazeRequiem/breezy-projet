const express = require("express");
const router = express.Router();
const likeController = require("../controllers/likeController");
const verifyToken = require("../middlewares/auth");

/**
 * @swagger
 * /api/likes/{messageId}:
 *   post:
 *     summary: Liker un message
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201: { description: Like créé }
 *       404: { description: Message introuvable }
 *       409: { description: Déjà liké }
 *   delete:
 *     summary: Retirer son like
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Like retiré }
 *       404: { description: Vous n'avez pas liké ce message }
 *   get:
 *     summary: Liste des likes d'un message
 *     tags: [Likes]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Liste des likes }
 */
router.post("/:messageId", verifyToken, likeController.like);
router.delete("/:messageId", verifyToken, likeController.unlike);

/**
 * @swagger
 * /api/likes/{messageId}/status:
 *   get:
 *     summary: Statut de like d'un message pour l'utilisateur courant
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Compteur + si l'utilisateur a liké
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 likesCount: { type: integer }
 *                 likedByMe: { type: boolean }
 */
router.get("/:messageId/status", verifyToken, likeController.getStatus);
router.get("/:messageId", likeController.getByMessage);

module.exports = router;