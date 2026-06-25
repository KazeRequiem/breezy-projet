const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const verifyToken = require("../middlewares/auth");
const checkRole = require("../middlewares/checkRole");

/**
 * @swagger
 * /api/reports/{messageId}:
 *   post:
 *     summary: Signaler un message
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201: { description: Signalement créé }
 *       404: { description: Message introuvable }
 *       409: { description: Déjà signalé par cet utilisateur }
 *   delete:
 *     summary: Traiter (supprimer tous les signalements d'un message)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Signalements supprimés }
 *       403: { description: Réservé aux modérateurs/admins }
 *       404: { description: Aucun signalement à traiter }
 */
router.post("/:messageId", verifyToken, reportController.report);

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Tableau de bord de modération (messages signalés, groupés + compteur)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Messages signalés, triés du plus signalé
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id: { type: string, description: ID du message }
 *                   reportsCount: { type: integer }
 *       403: { description: Réservé aux modérateurs/admins }
 */
router.get("/", verifyToken, checkRole(["moderator", "admin"]), reportController.getReports);

router.delete("/:messageId", verifyToken, checkRole(["moderator", "admin"]), reportController.dismiss);

module.exports = router;