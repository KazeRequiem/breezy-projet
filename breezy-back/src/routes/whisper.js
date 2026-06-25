const express = require("express");
const router = express.Router();
const whisperController = require("../controllers/whisperController");
const verifyToken = require("../middlewares/auth");

/**
 * @swagger
 * /api/whispers/{id}:
 *   delete:
 *     summary: Supprimer son propre whisper
 *     tags: [Whispers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID du whisper
 *     responses:
 *       200: { description: Whisper supprimé }
 *       403: { description: Vous n'êtes pas l'auteur }
 *       404: { description: Whisper introuvable }
 */
router.delete("/:id", verifyToken, whisperController.remove);

module.exports = router;